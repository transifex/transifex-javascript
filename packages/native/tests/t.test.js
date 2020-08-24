/* globals describe, it */

import { expect } from 'chai';
import {
  tx, t, ThrowErrorPolicy, SourceErrorPolicy,
} from '../src/index';

describe('t function', () => {
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
    const prevPolicy = tx.errorPolicy;

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

    tx.init({
      errorPolicy: prevPolicy,
    });
  });
});
