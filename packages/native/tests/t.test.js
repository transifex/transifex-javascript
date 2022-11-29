/* globals describe, it, beforeEach */

import { expect } from 'chai';
import {
  createNativeInstance, ThrowErrorPolicy, SourceErrorPolicy,
} from '../src/index';
import { generateKey } from '../src/utils';

describe('t function', () => {
  let t;
  let tx;

  beforeEach(() => {
    tx = createNativeInstance();
    t = tx.translate.bind(tx);
  });

  it('translates string', () => {
    expect(t('Hello')).to.equal('Hello');
    expect(t('Hello {username}', { username: 'Joe' }))
      .to.equal('Hello Joe');
  });

  it('escapes variables', () => {
    expect(t('Hello {username}', { username: '<b>Joe</b>', _escapeVars: true }))
      .to.equal('Hello &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('does not escape source by default', () => {
    expect(t('<b>Hello</b> {username}', { username: '<b>Joe</b>' }))
      .to.equal('<b>Hello</b> <b>Joe</b>');
  });

  it('handles invalid parameters when _escapeVars is used', () => {
    expect(t('Hello {username}', {
      username: '<b>Joe</b>',
      obj: { foo: 'bar' },
      _escapeVars: true,
    })).to.equal('Hello &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('handles invalid parameters', () => {
    expect(t('Hello {username}', {
      username: '<b>Joe</b>',
      obj: { foo: 'bar' },
    })).to.equal('Hello <b>Joe</b>');
  });

  it('uses error policy', () => {
    tx.init({
      errorPolicy: new ThrowErrorPolicy(),
    });
    expect(() => t('Hello {username}'))
      .to.throw();

    tx.init({
      errorPolicy: new SourceErrorPolicy(),
    });
    expect(t('Hello {username}'))
      .to.equal('Hello {username}');
  });

  it('handles plurals', () => {
    const prevLocale = tx.currentLocale;
    // Using JSON to deepcopy the cache because we don't have lodash available
    const prevTranslationsByLocale = JSON.parse(JSON.stringify(
      tx.cache.translationsByLocale,
    ));

    const sourceString = '{cnt, plural, one {you have # message} other {you have # messages}}';
    const key = generateKey(sourceString);
    tx.cache.update(
      'el',
      { [key]: '{???, plural, one {έχετε # μήνυμα} other {έχετε # μηνύματα}}' },
    );
    tx.currentLocale = 'el';
    expect(t(sourceString, { cnt: 1 })).to.equal('έχετε 1 μήνυμα');
    expect(t(sourceString, { cnt: 2 })).to.equal('έχετε 2 μηνύματα');

    // Restore the 'tx' object
    tx.currentLocale = prevLocale;
    tx.cache.translationsByLocale = prevTranslationsByLocale;
  });

  it('always returns a string', () => {
    expect(t('{number}', {
      number: 1,
    })).to.equal('1');
    expect(t({})).to.equal('[object Object]');
    expect(t(null)).to.equal('null');
  });
});
