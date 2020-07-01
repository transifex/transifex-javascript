import { expect } from 'chai';
import { escapeHtml, generateKey } from '../src/index';

describe('Util functions', () => {
  it('escapeHtml', () => {
    expect(escapeHtml('<b>Hello</b>')).to.equal('&lt;b&gt;Hello&lt;/b&gt;');
  });

  it('generateKey', () => {
    expect(generateKey('foo')).
      to.equal('2028d52912f9f7df555c9b5b7e886477');
    expect(generateKey('Hello {username}')).
      to.equal('52f77f95a06daa76876c5cf97c04ac39');
    expect(generateKey('Γειά σου {username}')).
      to.equal('496bd9f3c08c431bca41a73fc9d333f8');
    expect(generateKey('I have {n, plural, one {# apple} other {# apples}}')).
      to.equal('21a07a689ffa510ed943839d7f4c7a52');

    // overrides key
    expect(generateKey('foo', {_key: 'bar'})).to.equal('bar');
  });
});
