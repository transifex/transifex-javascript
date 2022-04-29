const { implodePlurals } = require('@transifex/native');
const _ = require('lodash');
const { mergePayload } = require('../merge');
const { createPayload, isPayloadValid } = require('./utils');

const PLURAL_MAP = {
  _1: 'one',
  _2: 'two',
  _3: 'few',
  _4: 'many',
  _5: 'other',
  _one: 'one',
  _two: 'two',
  _few: 'few',
  _many: 'many',
  _other: 'other',
};

/**
 * Parse i18next JSON v3 & v4 files
 *
 * @param {Object} HASHES A map of keys and content for phrases
 * @param {String} source The content we want to parse
 * @param {String} relativeFile occurence
 * @param {Object} options
 * @param {String[]} options.appendTags
 * @param {String[]} options.filterWithTags
 * @param {String[]} options.filterWithoutTags
 * @param {Boolean} options.useHashedKeys
 */
function extractI18NextPhrases(HASHES, source, relativeFile, options) {
  let json = {};
  try {
    json = JSON.parse(source);
  } catch (err) {
    return;
  }

  const plurals = {};

  _.each(json, (string, key) => {
    // nesting
    if (!_.isString(string) && !_.isArray(string) && _.isObject(string)) {
      _.each(string, (innerString, innerKey) => {
        if (!_.isString(innerString)) return;
        const partial = createPayload(innerString, {}, relativeFile, options);
        if (!isPayloadValid(partial, options)) return;

        mergePayload(HASHES, {
          [`${key}.${innerKey}`]: {
            string: partial.string,
            meta: partial.meta,
          },
        });
      });
      return;
    }

    if (!_.isString(string)) return;

    let isPlural = false;
    _.each(_.keys(PLURAL_MAP), (suffix) => {
      if (_.endsWith(key, suffix)) {
        isPlural = true;
        const pluralKey = key.slice(0, -suffix.length);
        plurals[pluralKey] = plurals[pluralKey] || {};
        plurals[pluralKey][PLURAL_MAP[suffix]] = string;
      }
    });
    if (isPlural) return;

    const partial = createPayload(string, {}, relativeFile, options);
    if (!isPayloadValid(partial, options)) return;

    mergePayload(HASHES, {
      [key]: {
        string: partial.string,
        meta: partial.meta,
      },
    });
  });

  // add plurals
  _.each(plurals, (plural, key) => {
    const partial = createPayload(implodePlurals(plural, 'count'), {}, relativeFile, options);
    if (!isPayloadValid(partial, options)) return;

    mergePayload(HASHES, {
      [`${key}_txplural`]: {
        string: partial.string,
        meta: partial.meta,
      },
    });
  });
}

module.exports = {
  extractI18NextPhrases,
};
