/* globals describe, it */

const { expect } = require('chai');
const { extractPhrases } = require('../../src/api/extract');

describe('extractPhrases with hashed keys', () => {
  it('works with webpack', async () => {
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js', {
      useHashedKeys: true,
    }))
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
    expect(await extractPhrases('test/fixtures/webpack.js', 'webpack.js', {
      useHashedKeys: true,
      appendTags: ['g1', 'g2'],
    }))
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
    expect(await extractPhrases('test/fixtures/node.js', 'node.js', {
      useHashedKeys: true,
    }))
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
    expect(await extractPhrases('test/fixtures/react.jsx', 'react.jsx', {
      useHashedKeys: true,
    }))
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
        '57b0d93fc0e1c3af68a41214147efd97': {
          string: 'Text 5',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '121b687b8625b4e58ba7f36dca77ad7f': {
          string: 'Text <1>6</1>',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '3ed8a3c47f6a32ece9c9ae0c2a060d45': {
          string: 'Text <1><2>7</2></1>',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '1ecaf4c087b894bf86987fc2972ddba7': {
          string: 'Text 8',
          meta: { context: ['foo'], tags: [], occurrences: ['react.jsx'] },
        },
        f9818c4a4b3772c365b8522ff29cb785: {
          string: 'Text <1/> 9',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '37678ce8d9c3a694ce19b947c64b9787': {
          string: 'Text {msg}',
          meta: { context: [], tags: [], occurrences: ['react.jsx'] },
        },
        '5c6622f57e93ed83011b45833a12b0aa': {
          string: 'Text 10',
          meta: { context: [], tags: ['tag1', 'tag2'], occurrences: ['react.jsx'] },
        },
      });
  });

  it('works with tsx', async () => {
    expect(await extractPhrases('test/fixtures/react.tsx', 'react.tsx', {
      useHashedKeys: true,
    }))
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

  it('works with angular typescript', async () => {
    expect(await extractPhrases('test/fixtures/typescript.ts', 'typescript.ts', {
      useHashedKeys: true,
    }))
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
    expect(await extractPhrases('test/fixtures/decorators.js', 'decorators.js', {
      useHashedKeys: true,
    }))
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
    expect(await extractPhrases('test/fixtures/classproperties.js', 'classproperties.js', {
      useHashedKeys: true,
    }))
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
    expect(await extractPhrases('test/fixtures/variables.js', 'variables.js', {
      useHashedKeys: true,
    }))
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
    expect(await extractPhrases('test/fixtures/angular-template.html', 'angular-template.html', {
      useHashedKeys: true,
    }))
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
          meta: { context: [], occurrences: ['angular-template.html'], tags: [] },
          string: 'This is a test',
        },
        'text.pipe_text': {
          string: 'This is a pipe text',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
        },
        def7319eabb4be374d5fae8ea5b79d55: {
          string: 'This is a second pipe text',
          meta: { context: [], tags: [], occurrences: ['angular-template.html'] },
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
        '867b7cc4643da9b4c97ababa43c50c23': {
          string: 'Used in a {binding}',
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
        '30846bf58089a2c546dd18b0aa3005c1': {
          string: '\n      This is a\n      second pipe text\n      ',
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
      useHashedKeys: true,
    }))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['vuejs.vue'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        '16c514ade457a04f8a5e074fe705fd09': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['vuejs.vue'] },
        },
        ff6354c17646535001825818343d64f3: {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        '8f97e92d0cd43c9012279b607c3c6e70': {
          string: 'Text {somevalue}',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        fda1ca1ccc076b7eb193aff7a8a006b5: {
          string: 'Text {someothervalue}',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        b1cb1acd2052787f97693d8eb660e366: {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'Text 7',
        },
        bc34d6c4a81fe6764e851ef5c4597f9b: {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'Text 8',
        },
        c2f94cf9d2c1065bc2ef5e766fa0f4ca: {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'A prop string',
        },
        f6d3188db065ecf6b7b4165b030f3bc6: {
          meta: {
            context: [],
            occurrences: [
              'vuejs.vue',
            ],
            tags: [],
          },
          string: 'Text 9 with siblings',
        },
        '57b0d93fc0e1c3af68a41214147efd97': {
          string: 'Text 5',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        d42dd30c271a7dc6ecfaddd2cee7e457: {
          string: 'Text in script',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
        '2d97d5484416727f585501ee9f842ab1': {
          string: 'Text in script setup',
          meta: { context: [], tags: [], occurrences: ['vuejs.vue'] },
        },
      });
  });

  it('works with pug', async () => {
    expect(await extractPhrases('test/fixtures/pugjs.pug', 'pugjs.pug', {
      useHashedKeys: true,
    }))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['pugjs.pug'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
        '16c514ade457a04f8a5e074fe705fd09': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['pugjs.pug'] },
        },
        ff6354c17646535001825818343d64f3: {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
        '8f97e92d0cd43c9012279b607c3c6e70': {
          string: 'Text {somevalue}',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
        fda1ca1ccc076b7eb193aff7a8a006b5: {
          string: 'Text {someothervalue}',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
        '57b0d93fc0e1c3af68a41214147efd97': {
          string: 'Text 5',
          meta: { context: [], tags: [], occurrences: ['pugjs.pug'] },
        },
      });
  });
  it('works with ejs', async () => {
    expect(await extractPhrases('test/fixtures/ejs.ejs', 'ejs.ejs', {
      useHashedKeys: true,
    }))
      .to.deep.equal({
        '6f48100ca5a57d2db9b685a8373be8a6': {
          string: 'Text 1',
          meta: {
            character_limit: 10,
            context: ['foo'],
            tags: ['tag1', 'tag2'],
            developer_comment: 'comment',
            occurrences: ['ejs.ejs'],
          },
        },
        '5d47152bcd597dd6adbff4884374aaad': {
          string: 'Text 2',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
        '3cd62915590816fdbf53852e44ee675a': {
          string: 'Text 3',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
        '33f5afa925f1464280d72d6d9086057c': {
          string: 'Text 4',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
        '16c514ade457a04f8a5e074fe705fd09': {
          string: '<b>HTML text</b>',
          meta: { context: [], tags: ['tag1'], occurrences: ['ejs.ejs'] },
        },
        ff6354c17646535001825818343d64f3: {
          string: '<b>HTML inline text</b>',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
        '8f97e92d0cd43c9012279b607c3c6e70': {
          string: 'Text {somevalue}',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
        fda1ca1ccc076b7eb193aff7a8a006b5: {
          string: 'Text {someothervalue}',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
        '57b0d93fc0e1c3af68a41214147efd97': {
          string: 'Text 5',
          meta: { context: [], tags: [], occurrences: ['ejs.ejs'] },
        },
      });
  });
});
