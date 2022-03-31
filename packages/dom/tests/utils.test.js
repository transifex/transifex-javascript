/* globals describe, it */

import { expect } from 'chai';
import {
  decodeString,
  encodeString,
  isFunction,
  isString,
  mergeArrays,
  removeComments,
  removeFromArray,
  stripWhitespace,
} from '../src/utils';

describe('Util functions', () => {
  it('isFunction', () => {
    expect(isFunction(() => {})).to.equal(true);
    expect(isFunction()).to.equal(false);
    expect(isFunction('Hello')).to.equal(false);
    expect(isFunction({})).to.equal(false);
    expect(isFunction(10)).to.equal(false);
  });

  it('isString', () => {
    expect(isString(() => {})).to.equal(false);
    expect(isString()).to.equal(false);
    expect(isString('Hello')).to.equal(true);
    expect(isString({})).to.equal(false);
    expect(isString(10)).to.equal(false);
  });

  it('mergeArrays', () => {
    expect(mergeArrays([1, 2], [2, 3])).to.deep.equal([1, 2, 3]);
  });

  it('removeFromArray', () => {
    const array = [1, 2, 3];
    expect(removeFromArray(array, 2)).to.equal(true);
    expect(array).to.deep.equal([1, 3]);
  });

  it('decodeString', () => {
    const str = 'foo &nbsp; bar';
    expect(encodeString(decodeString(str))).to.equal(str);
  });

  it('stripWhitespace', () => {
    expect(stripWhitespace('foo\n\nbar\t\tfoo  ')).to.equal('foo bar foo');
  });

  it('removeComments', () => {
    expect(removeComments('foo <!-- this is a comment --> bar')).to.equal('foo  bar');
  });
});
