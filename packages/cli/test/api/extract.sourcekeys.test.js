/* globals describe, it */

const { expect } = require('chai');
const { extractPhrases } = require('../../src/api/extract');

describe('extractPhrases with source keys', () => {
  it('works with webpack', async () => {
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js'))
      .to.deep.equal({
        'Text 1::foo': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['webpack.js'],
          },
        },
        'Text 2': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['webpack.js'] },
        },
        'Text 3': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['webpack.js'] },
        },
        'Text 4': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['webpack.js'] },
        },
      });
  });

  it('works with append tags', async () => {
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js', {
      appendTags: ['g1', 'g2'],
    }))
      .to.deep.equal({
        'Text 1::foo': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2', 'g1', 'g2'],
            developer_comment: 'comment',
            occurrences: ['webpack.js'],
          },
        },
        'Text 2': {
          string: 'Text 2',
          meta: { context: [], tags: ['g1', 'g2'], occurrences: ['webpack.js'] },
        },
        'Text 3': {
          string: 'Text 3',
          meta: { context: [], tags: ['g1', 'g2'], occurrences: ['webpack.js'] },
        },
        'Text 4': {
          string: 'Text 4',
          meta: { context: [], tags: ['g1', 'g2'], occurrences: ['webpack.js'] },
        },
      });
  });

  it('works with node', async () => {
    expect(await extractPhrases('test/fixtures/node.js', 'node.js'))
      .to.deep.equal({
        'Text 1::foo': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['node.js'],
          },
        },
        'Text 2': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['node.js'] },
        },
        'Text 3': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['node.js'] },
        },
        'Text 4': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['node.js'] },
        },
      });
  });

  it('works with jsx', async () => {
    expect(await extractPhrases('test/fixtures/react.jsx', 'react.jsx'))
      .to.deep.equal({
        'uses useT': {
          string: 'uses useT',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        'uses useT as const': {
          string: 'uses useT as const',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        'uses _str as const': {
          string: 'uses _str as const',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        'Text 1::foo': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['react.jsx'],
          },
        },
        'Text 2': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        'Text 3': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        'Text 4': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        'A {button} and a {bold} walk into a bar': {
          string: 'A {button} and a {bold} walk into a bar',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        button: {
          string: 'button',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        bold: {
          string: 'bold',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '<b>HTML text</b>': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['react.jsx'] },
        },
        '<b>HTML inline text</b>': {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
      });
  });

  it('works with tsx', async () => {
    expect(await extractPhrases('test/fixtures/react.tsx', 'react.tsx'))
      .to.deep.equal({
        'Text 1::foo': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['react.tsx'],
          },
        },
        'Text 2': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        'Text 3': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        'Text 4': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        'A {button} and a {bold} walk into a bar': {
          string: 'A {button} and a {bold} walk into a bar',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        button: {
          string: 'button',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        bold: {
          string: 'bold',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
        '<b>HTML text</b>': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['react.tsx'] },
        },
        '<b>HTML inline text</b>': {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['react.tsx'] },
        },
      });
  });

  it('works with angular typescript', async () => {
    expect(await extractPhrases('test/fixtures/typescript.ts', 'typescript.ts'))
      .to.deep.equal({
        'text.monday': {
          string: 'Monday',
          meta: { context: [], tags: [], occurrences: ['typescript.ts'] },
        },
        Shoes: {
          string: 'Shoes',
          meta: { context: [], tags: [], occurrences: ['typescript.ts'] },
        },
      });
  });

  it('works with decorators', async () => {
    expect(await extractPhrases('test/fixtures/decorators.js', 'decorators.js'))
      .to.deep.equal({
        'Component with decorator': {
          string: 'Component with decorator',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
        'TestClass1 example': {
          string: 'TestClass1 example',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
        'TestClass2 example': {
          string: 'TestClass2 example',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
        'TestClass3 example': {
          string: 'TestClass3 example',
          meta: { context: [], tags: [], occurrences: ['decorators.js'] },
        },
      });
  });

  it('works with class properties', async () => {
    expect(await extractPhrases('test/fixtures/classproperties.js', 'classproperties.js'))
      .to.deep.equal({
        'Static Property text': {
          string: 'Static Property text',
          meta: { context: [], tags: [], occurrences: ['classproperties.js'] },
        },
        'Instance property text': {
          string: 'Instance property text',
          meta: { context: [], tags: [], occurrences: ['classproperties.js'] },
        },
        'Static Function text': {
          string: 'Static Function text',
          meta: { context: [], tags: [], occurrences: ['classproperties.js'] },
        },
      });
  });

  it('works with const identifiers', async () => {
    expect(await extractPhrases('test/fixtures/variables.js', 'variables.js'))
      .to.deep.equal({
        abc: {
          string: 'abc',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        'Outer Text': {
          string: 'Outer Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        ' Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text': {
          string: ' Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        'Outer Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text': {
          string: 'Outer Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        abcdefg: {
          string: 'abcdefg',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        'Inner Text': {
          string: 'Inner Text',
          meta: { context: [], tags: [], occurrences: ['variables.js'] },
        },
        'Inner Text,Outer Text': {
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
        'This is a second pipe text': {
          string: 'This is a second pipe text',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        '\n      This is a\n      second pipe text\n      ': {
          string: '\n      This is a\n      second pipe text\n      ',
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
        'text.pipe_text_third': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [],
          },
          string: 'This is a third pipe text',
        },
        'text.pipe_text_seventh': {
          string: 'This is a seventh pipe test for additional white spaces',
          meta: { context: [], tags: ['tagA', 'tagB'], occurrences: ['angular-template.html'] },
        },
        'Used in a {binding}': {
          string: 'Used in a {binding}',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'text.pipe_binding': {
          string: 'Used in a second binding',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        'content.is-text': {
          string: 'This is a text with a context, and it should be recognized as one',
          meta: { context: ['is-text'], tags: [], occurrences: ['angular-template.html'] },
        },
        'my-str-key': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [
              'my-str-tag',
            ],
          },
          string: 'My str',
        },
        'password.key': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [
              'tagAa',
              'tagBa',
            ],
          },
          string: 'Password',
        },
        'some-key': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [
              't1',
              't2',
            ],
          },
          string: '{var1}',
        },
        'some-key-two': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [
              't3',
              't4',
            ],
          },
          string: '{var2}',
        },
        'some-key-three': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [],
          },
          string: '{var3}',
        },
        'some-key-four': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [
              'some tags',
            ],
          },
          string: '{var4}',
        },
        'text.inside-self-closing-tag': {
          meta: {
            context: [],
            occurrences: [
              'angular-template.html',
            ],
            tags: [],
          },
          string: 'This is some text inside a self-closing tag',
        },
      });
  });

  it('works with vue', async () => {
    expect(await extractPhrases('test/fixtures/vuejs.vue', 'vuejs.vue', {
      useHashedKeys: false,
    }))
      .to.deep.equal({
        'Text 1::foo': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['vuejs.vue'],
          },
        },
        'Text 2': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text 3': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text 4': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        '<b>HTML text</b>': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['vuejs.vue'] },
        },
        '<b>HTML inline text</b>': {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text {somevalue}': {
          string: 'Text {somevalue}',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text {someothervalue}': {
          string: 'Text {someothervalue}',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text 5': {
          string: 'Text 5',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text 6': {
          string: 'Text 6',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        'Text 7': {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'Text 7',
        },
        'Text 8': {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'Text 8',
        },
        'A prop string': {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'A prop string',
        },
        'Text 9 with siblings': {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'Text 9 with siblings',
        },
      });
  });
});
