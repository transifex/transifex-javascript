const _ = require('lodash');
const { mergePayload } = require('../merge');

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
function extractTXNativeJSONPhrases(HASHES, source, relativeFile, options) {
  let json = {};
  try {
    json = JSON.parse(source);
  } catch (err) {
    return;
  }
  _.each(json, (value, key) => {
    mergePayload(HASHES, {
      [key]: value,
    });
    if (options.appendTags) {
      mergePayload(HASHES, {
        [key]: {
          meta: {
            tags: options.appendTags,
          },
        },
      });
    }
  });
}

module.exports = {
  extractTXNativeJSONPhrases,
};
