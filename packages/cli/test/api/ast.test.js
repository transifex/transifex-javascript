/* globals describe, it */

const { expect } = require('chai');
const babelParser = require('@babel/parser');
const { getPath } = require('../../src/api/ast');

function test(code, result) {
  const ast = babelParser.parse(code);
  const node = ast.program.body[0].expression;
  expect(getPath(node)).to.equal(result);
}

describe('getPath', () => {
  it('simple case', () => { test('a(1)', 'a'); });
  it('attribute access', () => { test('a.b(1)', 'a.b'); });
  it('multiple attribute access', () => { test('a.b.c.d(1)', 'a.b.c.d'); });
  it('returns null on weird code', () => {
    test('a.b[0].d(1)', null);
    test('a.b(0).d(1)', null);
  });
});
