/* globals describe, it */

const { expect } = require('chai');
const { extractPhrases } = require('../../src/api/extract');

describe('extractPhrases with TXNativeJSON parser', () => {
  it('works with json', async () => {
    expect(await extractPhrases('test/fixtures/wsnative.json', 'wsnative.json', { parser: 'wsnativejson' }))
      .to.deep.equal({
        key1: {
          string: 'str1',
          meta: { tags: ['tag1', 'tag2'] },
        },
        key2: {
          string: 'str2',
        },
      });
  });
});
