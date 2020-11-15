/* globals describe, it */

const { expect } = require('chai');
const extractPhrases = require('../../src/api/extract');
const { SourceString } = require('../../src/api/strings');

describe('extractPhrases', () => {
  it('works with webpack', async () => {
    const strings = await extractPhrases({
      filename: 'test/fixtures/webpack.js',
    });
    expect(strings.length).to.equal(4);
    expect(strings.get('6f48100ca5a57d2db9b685a8373be8a6')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 1',
        characterLimit: 10,
        context: ['foo'],
        tags: ['tag1', 'tag2'],
        developerComment: 'comment',
        occurrences: ['test/fixtures/webpack.js'],
      }));
    expect(strings.get('5d47152bcd597dd6adbff4884374aaad')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 2',
        occurrences: ['test/fixtures/webpack.js'],
      }));
    expect(strings.get('3cd62915590816fdbf53852e44ee675a')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 3',
        occurrences: ['test/fixtures/webpack.js'],
      }));
    expect(strings.get('33f5afa925f1464280d72d6d9086057c')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 4',
        occurrences: ['test/fixtures/webpack.js'],
      }));
  });

  it('works with global tags', async () => {
    const strings = await extractPhrases({
      filename: 'test/fixtures/webpack.js',
      globalTags: ['g1', 'g2'],
    });
    expect(strings.length).to.equal(4);
    expect(strings.get('6f48100ca5a57d2db9b685a8373be8a6')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 1',
        characterLimit: 10,
        context: ['foo'],
        tags: ['tag1', 'tag2', 'g1', 'g2'],
        developerComment: 'comment',
        occurrences: ['test/fixtures/webpack.js'],
      }));
    expect(strings.get('5d47152bcd597dd6adbff4884374aaad')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 2',
        occurrences: ['test/fixtures/webpack.js'],
        tags: ['g1', 'g2'],
      }));
    expect(strings.get('3cd62915590816fdbf53852e44ee675a')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 3',
        occurrences: ['test/fixtures/webpack.js'],
        tags: ['g1', 'g2'],
      }));
    expect(strings.get('33f5afa925f1464280d72d6d9086057c')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 4',
        occurrences: ['test/fixtures/webpack.js'],
        tags: ['g1', 'g2'],
      }));
  });

  it('works with node', async () => {
    const strings = await extractPhrases({
      filename: 'test/fixtures/node.js',
    });
    expect(strings.length).to.equal(4);
    expect(strings.get('6f48100ca5a57d2db9b685a8373be8a6')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 1',
        characterLimit: 10,
        context: ['foo'],
        tags: ['tag1', 'tag2'],
        developerComment: 'comment',
        occurrences: ['test/fixtures/node.js'],
      }));
    expect(strings.get('5d47152bcd597dd6adbff4884374aaad')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 2',
        occurrences: ['test/fixtures/node.js'],
      }));
    expect(strings.get('3cd62915590816fdbf53852e44ee675a')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 3',
        occurrences: ['test/fixtures/node.js'],
      }));
    expect(strings.get('33f5afa925f1464280d72d6d9086057c')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 4',
        occurrences: ['test/fixtures/node.js'],
      }));
  });

  it('works with jsx', async () => {
    const strings = await extractPhrases({
      filename: 'test/fixtures/react.jsx',
    });
    expect(strings.length).to.equal(4);
    expect(strings.get('6f48100ca5a57d2db9b685a8373be8a6')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 1',
        characterLimit: 10,
        context: ['foo'],
        tags: ['tag1', 'tag2'],
        developerComment: 'comment',
        occurrences: ['test/fixtures/react.jsx'],
      }));
    expect(strings.get('5d47152bcd597dd6adbff4884374aaad')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 2',
        occurrences: ['test/fixtures/react.jsx'],
      }));
    expect(strings.get('3cd62915590816fdbf53852e44ee675a')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 3',
        occurrences: ['test/fixtures/react.jsx'],
      }));
    expect(strings.get('33f5afa925f1464280d72d6d9086057c')).to.deep
      .equal(new SourceString({
        sourceString: 'Text 4',
        occurrences: ['test/fixtures/react.jsx'],
      }));
  });
});
