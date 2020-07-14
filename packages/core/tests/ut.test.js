import { expect } from 'chai';
import {
  ut, getConfig, ERROR_POLICY, ERROR_POLICY_THROW, setConfig, ERROR_POLICY_SOURCE,
} from '../src/index';

describe('UT function', () => {
  it('translates', () => {
    expect(ut('Hello')).to.equal('Hello');
    expect(ut('Hello {username}', { username: 'Joe' })).
      to.equal('Hello Joe');
  });

  it('escapes variables', () => {
    expect(ut('Hello {username}', { username: '<b>Joe</b>' })).
      to.equal('Hello &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('does not escape source', () => {
    expect(ut('<b>Hello</b> {username}', { username: '<b>Joe</b>' })).
      to.equal('<b>Hello</b> &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('handles object variables', () => {
    expect(ut('Hello {username}', {
      username: '<b>Joe</b>',
      obj: { foo: 'bar' },
    })).to.equal('Hello &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('with _safe works', () => {
    expect(ut('Hello {username}', { _safe: true, username: '<b>Joe</b>' })).
      to.equal('Hello <b>Joe</b>');
  });

  it('handles object variables with _safe', () => {
    expect(ut('Hello {username}', {
      _safe: true,
      username: '<b>Joe</b>',
      obj: { foo: 'bar' },
    })).to.equal('Hello <b>Joe</b>');
  });

  it('handles error policy', () => {
    const policy = getConfig(ERROR_POLICY);

    setConfig(ERROR_POLICY, ERROR_POLICY_THROW);
    expect(() => ut('Hello {username}')).
      to.throw();

    setConfig(ERROR_POLICY, ERROR_POLICY_SOURCE);
    expect(ut('Hello {username}')).
      to.equal('Hello {username}');

    setConfig(ERROR_POLICY, policy);
  });
});
