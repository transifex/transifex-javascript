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

  it('works with append tags', async () => {
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js', { appendTags: ['g1', 'g2'] }))
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
        '41ea834f9604545bba088de53e71a159': {
          string: 'uses useT as const',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '14a6af017c176654aaf0df13d1179418': {
          string: 'uses _str as const',
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
        'text.monday': {
          string: 'Monday',
          meta: { context: [], tags: [], occurrences: ['typescript.ts'] },
        },
        d3b72592c4af5b55aac2dd0c88a9422a: {
          string: 'Shoes',
          meta: { context: [], tags: [], occurrences: ['typescript.ts'] },
        },
      });
  });

  it('works with decorators', async () => {
    expect(await extractPhrases('test/fixtures/decorators.js', 'decorators.js'))
      .to.deep.equal({
        bc077c881a53b3575ffe7eaf390ffca4: {
          string: 'Component with decorator',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
        d1695cddb12ea34290ad14c90bc88a39: {
          string: 'TestClass1 example',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
        cf24b3ddbdaaa21f7aba79187ef01f63: {
          string: 'TestClass2 example',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
        d18654e576453293d60dbb2833b914f3: {
          string: 'TestClass3 example',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
      });
  });

  it('works with class properties', async () => {
    expect(await extractPhrases('test/fixtures/classproperties.js', 'classproperties.js'))
      .to.deep.equal({
        '4f8d30aecb6784371423169bd67067f4': {
          string: 'Static Property text',
          meta: { context: [], tags: [], occurrences: ['classproperties.js'] },
        },
        '6eb781ad9f94e72e7e3e1eb8d84e9b23': {
          string: 'Instance property text',
          meta: { context: [], tags: [], occurrences: ['classproperties.js'] },
        },
        a5341bc1ed5a4c2278f50fa60cd359c9: {
          string: 'Static Function text',
          meta: { context: [], tags: [], occurrences: ['classproperties.js'] },
        },
      });
  });

  it('works with const identifiers', async () => {
    expect(await extractPhrases('test/fixtures/variables.js', 'variables.js'))
      .to.deep.equal({
        '5d34b0b02c893763b0679f0aeab472ae': {
          string: 'abc',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        '06af01ed1976798d82a569a6e0af7537': {
          string: 'Outer Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        f089f645d1baa0ce4f398a4388520de3: {
          string: ' Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        ac186ba33ab07d1ba8864f15662c308c: {
          string: 'Outer Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        e5609fd3ccf5a0e9eea07d2a0918c2bd: {
          string: 'abcdefg',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        '3a2a11e5b86fdb8e2807170eca54171f': {
          string: 'Inner Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        '7c023dc6beb7e942ab667c8d32a488e7': {
          string: 'Inner Text,Outer Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
      });
  });

  it('works with angular html templates', async () => {
    expect(await extractPhrases('test/fixtures/angular-template.html', 'angular-template.html'))
      .to.deep.equal({
        'text.agree_message': {
          string: 'By proceeding you agree to the {terms_of_services} and {privacy_policy}.',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.intro_message': {
          string: 'It’s {weekday} today, and it is a fine day to try out Native! Checkout the offering below!',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.main_title': {
          string: 'This is a test',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.pipe_text': {
          string: 'This is a pipe text',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'def7319eabb4be374d5fae8ea5b79d55': {
          string: 'This is a second pipe text',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        '9eae72bb80f1d30adc39a97c56eb2f6b': {
          string: '\n      This is a\n      third pipe text\n      ',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.pipe_text_fourth': {
          string: 'This is a fourth pipe text',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.fifth': {
          string: 'It’s {weekday} today, and it is a fine day to try out Native!',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.pipe_text_sixth': {
          string: 'This is a sixth pipe text, no one should do this',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        '867b7cc4643da9b4c97ababa43c50c23': {
          string: 'Used in a {binding}',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.pipe_binding': {
          string: 'Used in a second binding',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        }
      });
  });
});
