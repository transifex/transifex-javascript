/* globals describe, it */

const { expect } = require('chai');
const extractPhrases = require('../../src/api/extract');

describe('extractPhrases', () => {
  it('works with webpack', async () => {
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js'))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['webpack.js'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['webpack.js'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['webpack.js'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['webpack.js'] },
        },
      });
  });

  it('works with global tags', async () => {
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js', ['g1', 'g2']))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2', 'g1', 'g2'],
            developer_comment: 'comment',
            occurrences: ['webpack.js'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: ['g1', 'g2'], occurrences: ['webpack.js'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: ['g1', 'g2'], occurrences: ['webpack.js'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: ['g1', 'g2'], occurrences: ['webpack.js'] },
        },
      });
  });

  it('works with node', async () => {
    expect(await extractPhrases('test/fixtures/node.js', 'node.js'))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['node.js'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['node.js'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['node.js'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['node.js'] },
        },
      });
  });

  it('works with jsx', async () => {
    expect(await extractPhrases('test/fixtures/react.jsx', 'react.jsx'))
      .to.deep.equal({
        a8b326ca0f8eacfd2ecf1140a860fccc: {
          string: 'uses useT',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['react.jsx'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '90da95711d6dc69953b2978d2bed9b7d': {
          string: 'A {button} and a {bold} walk into a bar',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        a667d8741bde4f79971b6220a0c0b647: {
          string: 'button',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        e5f9dda0c39f13357321d0c07bb7a3ff: {
          string: 'bold',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '16c514ade457a04f8a5e074fe705fd09': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['react.jsx'] },
        },
        ff6354c17646535001825818343d64f3: {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
      });
  });

  it('works with tsx', async () => {
    expect(await extractPhrases('test/fixtures/react.tsx', 'react.tsx'))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['react.tsx'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        '90da95711d6dc69953b2978d2bed9b7d': {
          string: 'A {button} and a {bold} walk into a bar',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        a667d8741bde4f79971b6220a0c0b647: {
          string: 'button',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        e5f9dda0c39f13357321d0c07bb7a3ff: {
          string: 'bold',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        '16c514ade457a04f8a5e074fe705fd09': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['react.tsx'] },
        },
        ff6354c17646535001825818343d64f3: {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
      });
  });

  it('works with typescript', async () => {
    expect(await extractPhrases('test/fixtures/typescript.ts', 'typescript.ts'))
      .to.deep.equal({
        d3b72592c4af5b55aac2dd0c88a9422a: {
          string: 'Shoes',
          meta: { context: [], tags: [], occurrences: ['typescript.ts'] },
        },
      });
  });
});
