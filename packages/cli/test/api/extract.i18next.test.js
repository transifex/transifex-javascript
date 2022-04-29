/* globals describe, it */

const { expect } = require('chai');
const { extractPhrases } = require('../../src/api/extract');

describe('extractPhrases with i18next parser', () => {
  it('works with json v4', async () => {
    expect(await extractPhrases('test/fixtures/i18next_v4.json', 'v4.json', { parser: 'i18next' }))
      .to.deep.equal({
        'keyDeep.inner': {
          string: 'value',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        key: {
          string: 'value',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyNesting: {
          string: 'reuse $t(keyDeep.inner)',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyInterpolate: {
          string: 'replace this {{value}}',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyInterpolateUnescaped: {
          string: 'replace this {{- value}}',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyInterpolateWithFormatting: {
          string: 'replace this {{value, format}}',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyContext_male: {
          string: 'the male variant',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyContext_female: {
          string: 'the female variant',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyPluralSimple_txplural: {
          string: '{count, plural, one {the singular} other {the plural}}',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyPluralMultipleEgArabic_zero: {
          string: 'the plural form 0',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        keyPluralMultipleEgArabic_txplural: {
          string: '{count, plural, one {the plural form 1} two {the plural form 2} few {the plural form 3} many {the plural form 4} other {the plural form 5}}',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        'keyWithObjectValue.valueA': {
          string: 'return this with valueB',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
        'keyWithObjectValue.valueB': {
          string: 'more text',
          meta: { context: [], tags: [], occurrences: ['v4.json'] },
        },
      });
  });
});
