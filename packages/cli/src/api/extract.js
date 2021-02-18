/* eslint no-underscore-dangle: 0 */

const fs = require('fs');
const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const _ = require('lodash');
const { generateKey } = require('@transifex/native');

const mergePayload = require('./merge');
const { stringToArray, mergeArrays } = require('./utils');

/**
 * Create an extraction payload
 *
 * @param {String} string
 * @param {Object} params
 * @param {String} params._context
 * @param {String} params._comment
 * @param {Number} params._charlimit
 * @param {Number} params._tags
 * @param {String} occurence
 * @param {String[]} appendTags
 * @returns {Object} Payload
 * @returns {String} Payload.string
 * @returns {String} Payload.key
 * @returns {String} Payload.meta.context
 * @returns {String} Payload.meta.developer_comment
 * @returns {Number} Payload.meta.character_limit
 * @returns {String[]} Payload.meta.tags
 * @returns {String[]} Payload.meta.occurrences
 */
function createPayload(string, params, occurence, appendTags) {
  return {
    string,
    key: generateKey(string, params),
    meta: _.omitBy({
      context: stringToArray(params._context),
      developer_comment: params._comment,
      character_limit: params._charlimit ? parseInt(params._charlimit, 10) : undefined,
      tags: mergeArrays(stringToArray(params._tags), appendTags),
      occurrences: [occurence],
    }, _.isNil),
  };
}

/**
 * Check if payload coming from createPayload is valid based on tag filters
 *
 * @param {Object} payload
 * @param {String[]} options.filterWithTags
 * @param {String[]} options.filterWithoutTags
 * @returns {Boolean}
 */
function isPayloadValid(payload, options = {}) {
  const { filterWithTags, filterWithoutTags } = options;
  let isValid = true;
  _.each(filterWithTags, (tag) => {
    if (!_.includes(payload.meta.tags, tag)) {
      isValid = false;
    }
  });
  _.each(filterWithoutTags, (tag) => {
    if (_.includes(payload.meta.tags, tag)) {
      isValid = false;
    }
  });
  return isValid;
}

/**
 * Check if callee is a valid Transifex Native function
 *
 * @param {*} node
 * @returns {Boolean}
 */
function isTransifexCall(node) {
  const { callee } = node;
  if (!callee) return false;
  if (_.includes(['t', 'useT'], callee.name)) { return true; }
  if (!callee.object || !callee.property) return false;
  if (callee.property.name === 'translate') return true;
  return false;
}

function _parse(source) {
  try {
    return babelParser.parse(
      source,
      {
        sourceType: 'unambiguous',
        plugins: [
          'decorators-legacy',
          'classProperties',
          'jsx',
          'typescript',
        ],
      },
    );
  } catch (e) {
    return babelParser.parse(
      source,
      {
        sourceType: 'unambiguous',
        plugins: [
          'decorators-legacy',
          'jsx',
          'flow',
        ],
      },
    );
  }
}

/**
 * Parse file and extract phrases using AST
 *
 * @param {String} file absolute file path
 * @param {String} relativeFile occurence
 * @param {Object} options
 * @param {String[]} options.appendTags
 * @param {String[]} options.filterWithTags
 * @param {String[]} options.filterWithoutTags
 * @returns {Object}
 */
function extractPhrases(file, relativeFile, options = {}) {
  const { appendTags } = options;
  const HASHES = {};
  const source = fs.readFileSync(file, 'utf8');
  const ast = _parse(source);
  babelTraverse(ast, {
    // T / UT functions
    CallExpression({ node }) {
      // Check if node is a Transifex function
      if (!isTransifexCall(node)) return;
      if (_.isEmpty(node.arguments)) return;

      // Verify that at least the string is passed to the function
      const string = node.arguments[0].value;
      if (!_.isString(string)) return;

      // Extract function parameters
      const params = {};
      if (
        node.arguments[1]
        && node.arguments[1].type === 'ObjectExpression'
      ) {
        _.each(node.arguments[1].properties, (prop) => {
          // get only string on number params
          if (_.isString(prop.value.value) || _.isNumber(prop.value.value)) {
            params[prop.key.name] = prop.value.value;
          }
        });
      }

      const partial = createPayload(string, params, relativeFile, appendTags);
      if (!isPayloadValid(partial, options)) return;

      mergePayload(HASHES, {
        [partial.key]: {
          string: partial.string,
          meta: partial.meta,
        },
      });
    },

    // React component
    JSXElement({ node }) {
      const elem = node.openingElement;

      if (!elem || !elem.name) return;
      if (elem.name.name !== 'T' && elem.name.name !== 'UT') return;

      let string;
      const params = {};
      _.each(elem.attributes, (attr) => {
        const property = attr.name && attr.name.name;
        const value = attr.value && attr.value.value;
        if (!property || !value) return;
        if (property === '_str') {
          string = value;
          return;
        }
        if (_.isString(value) || _.isNumber(value)) {
          params[property] = value;
        }
      });

      if (!string) return;

      const partial = createPayload(string, params, relativeFile, appendTags);
      if (!isPayloadValid(partial, options)) return;

      mergePayload(HASHES, {
        [partial.key]: {
          string: partial.string,
          meta: partial.meta,
        },
      });
    },
  });

  return HASHES;
}

module.exports = extractPhrases;
