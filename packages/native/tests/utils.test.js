/* globals describe, it */

import { expect } from 'chai';
import {
  escape,
  generateKey,
  isString,
  normalizeLocale,
  isBrowser,
  isNode,
  saveToSessionStorage,
  readFromSessionStorage,
} from '../src/index';

describe('Util functions', () => {
  it('escape', () => {
    expect(escape('<b>Hello</b>')).to.equal('&lt;b&gt;Hello&lt;/b&gt;');
  });

  it('generateKey', () => {
    expect(generateKey('foo'))
      .to.equal('2028d52912f9f7df555c9b5b7e886477');
    expect(generateKey('Hello {username}'))
      .to.equal('52f77f95a06daa76876c5cf97c04ac39');
    expect(generateKey('Γειά σου {username}'))
      .to.equal('496bd9f3c08c431bca41a73fc9d333f8');
    expect(generateKey('I have {n, plural, one {# apple} other {# apples}}'))
      .to.equal('21a07a689ffa510ed943839d7f4c7a52');

    // with context
    expect(generateKey('This is a nice phrase', {
      _context: 'some context',
    })).to.equal('1cef92f8501667684496766587608795');
    expect(generateKey('This is a nice phrase', {
      _context: 'context1,context2,context2',
    })).to.equal('ba7e05eb67b7854841bef07de562e618');

    // overrides key
    expect(generateKey('foo', { _key: 'bar' })).to.equal('bar');
  });

  it('isString', () => {
    expect(isString('')).to.equal(true);
    expect(isString('foo')).to.equal(true);
    expect(isString()).to.equal(false);
    expect(isString(4)).to.equal(false);
    expect(isString({})).to.equal(false);
  });

  it('normalizeLocale', () => {
    expect(normalizeLocale('en')).to.equal('en');
    expect(normalizeLocale('pt-br')).to.equal('pt_BR');
  });

  it('isBrowser', () => {
    expect(isBrowser()).to.equal(false);
  });

  it('isNode', () => {
    expect(isNode()).to.equal(true);
  });

  it('node session storage works', () => {
    saveToSessionStorage('akey', { foo: 'bar' });
    expect(readFromSessionStorage('akey')).to.deep.equal({ foo: 'bar' });
  });

  it('browser session storage works', () => {
    const storage = {};
    global.window = {
      document: {},
      sessionStorage: {
        setItem: (key, value) => {
          storage[key] = value;
        },
        getItem: (key) => storage[key],
      },
    };
    saveToSessionStorage('akey', { foo: 'bar' });
    expect(readFromSessionStorage('akey')).to.deep.equal({ foo: 'bar' });
    expect(readFromSessionStorage('akey2')).to.deep.equal(null);
    delete global.window;
  });

  it('browser session storage handles exceptions', () => {
    global.window = {
      document: {},
      sessionStorage: {
        setItem: () => {
          throw new Error();
        },
        getItem: () => { throw new Error(); },
      },
    };
    saveToSessionStorage('akey', { foo: 'bar' });
    expect(readFromSessionStorage('akey')).to.deep.equal(null);
    delete global.window;
  });

  it('browser session storage handles lack of support', () => {
    global.window = {
      document: {},
    };
    saveToSessionStorage('akey', { foo: 'bar' });
    expect(readFromSessionStorage('akey')).to.deep.equal(null);
    delete global.window;
  });
});
