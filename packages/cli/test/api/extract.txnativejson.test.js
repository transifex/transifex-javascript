/* globals describe, it */

const { expect } = require('chai');
const { extractPhrases } = require('../../src/api/extract');

describe('extractPhrases with TXNativeJSON parser', () => {
  it('works with json', async () => {
    expect(await extractPhrases('test/fixtures/txnative.json', 'txnative.json', { parser: 'txnativejson' }))
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
