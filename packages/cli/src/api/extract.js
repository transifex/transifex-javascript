/* eslint no-underscore-dangle: 0 */

const fs = require('fs');
const _ = require('lodash');

const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;

const { SourceString, SourceStringSet } = require('./strings');
const { getPath, getParams, getJSXParams } = require('./ast');

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
 * @param {String[]} globalTags
 * @returns {Object} Payload
 * @returns {String} Payload.string
 * @returns {String} Payload.key
 * @returns {String} Payload.meta.context
 * @returns {String} Payload.meta.developer_comment
 * @returns {Number} Payload.meta.character_limit
 * @returns {String[]} Payload.meta.tags
 * @returns {String[]} Payload.meta.occurrences
 */
function createPayload(sourceString, params, occurence, globalTags) {
  const result = new SourceString({ sourceString });
  _.forEach(Object.entries(params), ([key, value]) => {
    if (key === '_context') {
      result.context = value;
    } else if (key === '_charlimit') {
      result.characterLimit = value;
    } else if (key === '_comment') {
      result.developerComment = value;
    } else if (key === '_occurrences') {
      result.occurrences = value;
    } else if (key === '_tags') {
      result.tags = value;
    }
  });
  if (occurence) { result.occurrences.push(occurence); }
  if (globalTags) { result.tags = result.tags.concat(globalTags); }
  return result;
}

function _parse(source) {
  try {
    return babelParser.parse(
      source,
      { sourceType: 'unambiguous', plugins: ['jsx', 'typescript'] },
    );
  } catch (e) {
    return babelParser.parse(
      source,
      { sourceType: 'unambiguous', plugins: ['jsx', 'flow'] },
    );
  }
}

/**
 * Parse file and extract phrases using AST
 *
 * @param {String} file absolute file path
 * @param {String} relativeFile occurence
 * @param {String[]} globalTags
 * @returns {Object}
 */
function extractPhrases({
  filename, globalTags, extraFunctions, extraComponents,
}) {
  const source = fs.readFileSync(filename, 'utf8');
  const strings = new SourceStringSet();
  const ast = _parse(source);
  babelTraverse(ast, {
    CallExpression({ node }) {
      const functions = ['t', 'tx.translate', 'useT'].concat(extraFunctions || []);

      // Check if node is a Transifex function
      const path = getPath(node);
      if (!_.includes(functions, path)) { return; }
      if (_.isEmpty(node.arguments)) return;

      // Verify that at least the string is passed to the function
      const stringValue = node.arguments[0].value;
      if (!_.isString(stringValue)) return;

      const params = getParams(node.arguments[1]);

      const string = createPayload(
        stringValue, params, filename, globalTags,
      );
      strings.add(string);
    },

    // React component
    JSXElement({ node }) {
      const components = ['T', 'UT'].concat(extraComponents || []);
      const name = _.get(node, 'openingElement.name.name');
      if (!_.includes(components, name)) { return; }

      const params = getJSXParams(node.openingElement.attributes);
      const stringValue = params._str;
      delete params._str;
      if (!stringValue) return;

      const string = createPayload(stringValue, params, filename, globalTags);
      strings.add(string);
    },
  });

  return strings;
}

module.exports = extractPhrases;
