/* globals describe, it */

const { expect } = require('chai');
const { mergeArrays, stringToArray } = require('../../src/api/utils');

describe('Utils', () => {
  it('mergeArrays merges arrays', () => {
    expect(mergeArrays()).to.deep.equal([]);
    expect(mergeArrays([1, 2, 2])).to.deep.equal([1, 2]);
    expect(mergeArrays([1, 2], [2, 3, 4])).to.deep.equal([1, 2, 3, 4]);
  });

  it('stringToArray splits text to array', () => {
    expect(stringToArray()).to.deep.equal([]);
    expect(stringToArray(' foo,  bar')).to.deep.equal(['foo', 'bar']);
    expect(stringToArray('foo,')).to.deep.equal(['foo']);
  });
});
