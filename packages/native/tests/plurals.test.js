/* globals describe, it */

import { expect } from 'chai';
import {
  isPluralized, explodePlurals, implodePlurals,
} from '../src/index';

function testExplode(string, result) {
  expect(explodePlurals(string)).to.deep.equal(result);
}

describe('isPluralized', () => {
  it('detects pluralized strings', () => {
    expect(isPluralized('hello world')).to.equal(false);
    expect(isPluralized('{cnt, plural, one {ONE} other {OTHER}}'))
      .to.equal(true);
    expect(isPluralized('hello {cnt, plural, one {ONE} other {OTHER}}'))
      .to.equal(false);
  });
});

describe('explodePlurals', () => {
  it('should handle simple cases', () => {
    testExplode('hello world', [null, { other: 'hello world' }]);
    testExplode(
      '{cnt, plural, one {hello world} other {hello worlds}}',
      ['cnt', { one: 'hello world', other: 'hello worlds' }],
    );
    testExplode(
      '{cnt, plural, =1 {hello world} =5 {hello worlds}}',
      ['cnt', { one: 'hello world', other: 'hello worlds' }],
    );
    testExplode(
      '{cnt, plural, one {hello world} =5 {hello worlds}}',
      ['cnt', { one: 'hello world', other: 'hello worlds' }],
    );
    testExplode(
      '{cnt, plural, =1 {hello world} other {hello worlds}}',
      ['cnt', { one: 'hello world', other: 'hello worlds' }],
    );
  });

  it('should not explode with leading/tailing spaces', () => {
    testExplode(
      ' {cnt, plural, one {hello world} other {hello worlds}}',
      [null, { other: ' {cnt, plural, one {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, one {hello world} other {hello worlds}} ',
      [null, { other: '{cnt, plural, one {hello world} other {hello worlds}} ' }],
    );
  });

  it('should fail when missing opening/closing brackets', () => {
    testExplode(
      'cnt, plural, one {hello world} other {hello worlds}}',
      [null, { other: 'cnt, plural, one {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, one {hello world} other {hello worlds}',
      [null, { other: '{cnt, plural, one {hello world} other {hello worlds}' }],
    );
  });

  it('should fail if message is incomplete', () => {
    testExplode('{cnt}', [null, { other: '{cnt}' }]);
    testExplode('{cnt, }', [null, { other: '{cnt, }' }]);
    testExplode('{cnt, plural}', [null, { other: '{cnt, plural}' }]);
    testExplode('{cnt, plural, }', [null, { other: '{cnt, plural, }' }]);
    testExplode('{cnt, plural, one}', [null, { other: '{cnt, plural, one}' }]);
    testExplode('{cnt, plural, one {}', [null, { other: '{cnt, plural, one {}' }]);
    testExplode('{cnt, plural, one hello world}', [null, { other: '{cnt, plural, one hello world}' }]);
  });

  it('should fail if variable, plural keyword or rules are wrong', () => {
    testExplode(
      '{cn t, plural, one {hello world} other {hello worlds}}',
      [null, { other: '{cn t, plural, one {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, select, one {hello world} other {hello worlds}}',
      [null, { other: '{cnt, select, one {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, ouane {hello world} other {hello worlds}}',
      [null, { other: '{cnt, plural, ouane {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, =100 {hello world} other {hello worlds}}',
      [null, { other: '{cnt, plural, =100 {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, =1.3 {hello world} other {hello worlds}}',
      [null, { other: '{cnt, plural, =1.3 {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, =a {hello world} other {hello worlds}}',
      [null, { other: '{cnt, plural, =a {hello world} other {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, one {hello world} three {hello worlds}}',
      [null, { other: '{cnt, plural, one {hello world} three {hello worlds}}' }],
    );
    testExplode(
      '{cnt, plural, one {hello world} o ther {hello worlds}}',
      [null, { other: '{cnt, plural, one {hello world} o ther {hello worlds}}' }],
    );
  });

  it('should fail on missing plural strings', () => {
    testExplode('{cnt, plural, one', [null, { other: '{cnt, plural, one' }]);
    testExplode('{cnt, plural, one}', [null, { other: '{cnt, plural, one}' }]);
  });

  it('should handle nested brackets', () => {
    testExplode(
      '{cnt, plural, one {hello {world}} other {hello worlds}}',
      ['cnt', { one: 'hello {world}', other: 'hello worlds' }],
    );
  });

  it("should fail when minimum plural rules don't exist", () => {
    testExplode(
      '{cnt, plural, one {hello world}}',
      [null, { other: '{cnt, plural, one {hello world}}' }],
    );
    testExplode(
      '{cnt, plural, few {hello world} other {hello worlds}}',
      [null, { other: '{cnt, plural, few {hello world} other {hello worlds}}' }],
    );
  });

  it('should propertly escape stuff with apostrophes', () => {
    testExplode(
      "{cnt, plural, one {hello '{'world'}'} other {hello worlds}}",
      ['cnt', { one: "hello '{'world'}'", other: 'hello worlds' }],
    );
    testExplode(
      "{cnt, plural, one {hello '{world}'} other {hello worlds}}",
      ['cnt', { one: "hello '{world}'", other: 'hello worlds' }],
    );
    testExplode(
      "{cnt, plural, one {hello ''{world}''} other {hello worlds}}",
      ['cnt', { one: "hello ''{world}''", other: 'hello worlds' }],
    );
    testExplode(
      "{cnt, plural, one {hello '{'world} other {hello worlds}}",
      ['cnt', { one: "hello '{'world", other: 'hello worlds' }],
    );
    testExplode(
      "{cnt, plural, one {hello '{{'world} other {hello worlds}}",
      ['cnt',
        { one: "hello '{{'world", other: 'hello worlds' }],
    );
    testExplode(
      "{cnt, plural, one {hello 'world} other {hello worlds}}",
      ['cnt', { one: "hello 'world", other: 'hello worlds' }],
    );
  });
});

describe('implodePlurals', () => {
  it('should handle simple cases', () => {
    expect(implodePlurals({ zero: 'hello world' })).to
      .equal('{???, plural, zero {hello world}}');
    expect(implodePlurals({ one: 'hello world', two: 'hello worlds' })).to
      .equal('{???, plural, one {hello world} two {hello worlds}}');
  });

  it('should respect custom count variable', () => {
    expect(implodePlurals({ zero: 'hello world' }, 'count')).to
      .equal('{count, plural, zero {hello world}}');
  });

  it('should respect order', () => {
    expect(implodePlurals({ few: 'hello world', many: 'hello worlds' })).to
      .equal('{???, plural, few {hello world} many {hello worlds}}');
    expect(implodePlurals({ many: 'hello worlds', few: 'hello world' })).to
      .equal('{???, plural, few {hello world} many {hello worlds}}');
  });

  it('should ignore unknown rules', () => {
    expect(implodePlurals({ other: 'hello world', six: 'hello worlds' })).to
      .equal('{???, plural, other {hello world}}');
  });
});
