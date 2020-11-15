/* eslint no-underscore-dangle: 0 */

const fs = require('fs');
const _ = require('lodash');

const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;

const { SourceString, SourceStringSet } = require('./strings');
const { getPath } = require('./ast');

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

/**
 * Parse file and extract phrases using AST
 *
 * @param {String} file absolute file path
 * @param {String} relativeFile occurence
 * @param {String[]} globalTags
 * @returns {Object}
 */
function extractPhrases({ filename, globalTags, extraFunctions }) {
  const source = fs.readFileSync(filename, 'utf8');
  const strings = new SourceStringSet();
  const ast = babelParser.parse(
    source,
    { sourceType: 'unambiguous', plugins: ['jsx', 'typescript'] },
  );
  babelTraverse(ast, {
    CallExpression({ node }) {
      const functions = ['t', 'tx.translate'].concat(extraFunctions || []);

      // Check if node is a Transifex function
      const path = getPath(node);
      if (!_.includes(functions, path)) { return; }
      if (_.isEmpty(node.arguments)) return;

      // Verify that at least the string is passed to the function
      const stringValue = node.arguments[0].value;
      if (!_.isString(stringValue)) return;

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

      const string = createPayload(
        stringValue, params, filename, globalTags,
      );
      strings.add(string);
    },

    // React component
    JSXElement({ node }) {
      const elem = node.openingElement;

      if (!elem || !elem.name || elem.name.name !== 'T') return;

      let stringValue;
      const params = {};
      _.each(elem.attributes, (attr) => {
        const property = attr.name && attr.name.name;
        const value = attr.value && attr.value.value;
        if (!property || !value) return;
        if (property === '_str') {
          stringValue = value;
          return;
        }
        if (_.isString(value) || _.isNumber(value)) {
          params[property] = value;
        }
      });

      if (!stringValue) return;
      const string = createPayload(stringValue, params, filename, globalTags);
      strings.add(string);
    },
  });

  return strings;
}

module.exports = extractPhrases;
