import { expect } from 'chai';
import {
  t, setConfig, ERROR_POLICY, getConfig, ERROR_POLICY_THROW, ERROR_POLICY_SOURCE,
} from '../src/index';

describe('T function', () => {
  it('translates', () => {
    expect(t('Hello')).to.equal('Hello');
    expect(t('Hello {username}', { username: 'Joe' })).
      to.equal('Hello Joe');
  });

  it('escapes variables', () => {
    expect(t('Hello {username}', { username: '<b>Joe</b>' })).
      to.equal('Hello &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('escapes source', () => {
    expect(t('<b>Hello</b> {username}', { username: '<b>Joe</b>' })).
      to.equal('&lt;b&gt;Hello&lt;/b&gt; &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('handles error policy', () => {
    const policy = getConfig(ERROR_POLICY);

    setConfig(ERROR_POLICY, ERROR_POLICY_THROW);
    expect(() => t('Hello {username}')).
      to.throw();

    setConfig(ERROR_POLICY, ERROR_POLICY_SOURCE);
    expect(t('Hello {username}')).
      to.equal('Hello {username}');

    setConfig(ERROR_POLICY, policy);
  });
});
