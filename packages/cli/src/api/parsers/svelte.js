const _ = require('lodash');
const svelte = require('svelte/compiler');
const { createPayload, isPayloadValid } = require('./utils');
const { mergePayload } = require('../merge');
const { babelExtractPhrases } = require('./babel');

/**
 * A function to traverse the AST provided by the svelte package
 *
 * @param {*} ast
 * @param {*} visitor
 */
function traverseVueTemplateAst(ast, visitor = {}) {
  // Use this in order to identify expressions in the AST since there is no
  // Tag to identify it with when traversing
  const VISITORS = {
    2: 'Expression',
  };

  function traverseArray(array, parent) {
    array.forEach((child) => {
      // eslint-disable-next-line no-use-before-define
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    if (visitor.enter) visitor.enter(node, parent);
    if (visitor[node.tag]) visitor[node.tag](node, parent);
    // Take care of expressions
    if (visitor[VISITORS[node.type]] && node.expression) {
      visitor[VISITORS[node.type]](node, parent);
    }
    if (node.children) traverseArray(node.children, node);
    if (visitor.exit) visitor.exit(node, parent);
  }
  traverseNode(ast, null);
}

/**
 * Extracted function for the T/UT components to use as a visitor for the
 * template AST traverse.
 *
 * @param {Object} HASHES A map of keys and content for phrases
 * @param {String} relativeFile occurence
 * @param {Object} options
 * @param {String[]} options.appendTags
 * @param {String[]} options.filterWithTags
 * @param {String[]} options.filterWithoutTags
 * @param {Boolean} options.useHashedKeys
 * @returns {Function}
 */
function vueElementVisitor(HASHES, relativeFile, options) {
  return (node) => {
    let string;
    const params = {};
    _.each(node.attrsList, (attr) => {
      const property = attr.name;
      if (!property || !attr.value) return;

      const attrValue = attr.value;

      if (!attrValue) return;

      if (property === '_str') {
        string = attrValue;
        return;
      }
      params[property] = attrValue;
    });

    if (!string) return;

    const partial = createPayload(string, params, relativeFile, options);
    if (!isPayloadValid(partial, options)) return;

    mergePayload(HASHES, {
      [partial.key]: {
        string: partial.string,
        meta: partial.meta,
      },
    });
  };
}

/**
 * Parses the source with vue-template-compiler package and breaks the content
 * to "template" and "script".
 *
 * The script gets passed to babel as usual to get the phrases and the template
 * goes through compilation again to get the AST and a custom traverse
 * function in order to get the phrases back.
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
function extractSveltePhrases(HASHES, source, relativeFile, options) {
  // Use the Svelte API to parse content
  const svelteContent = svelte.parse(source);
  console.log(svelteContent)
  svelte.walk(svelteContent, {
    enter(node, parent, prop, index) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 't') {
        console.log(node)
        const stringNode = node.arguments[0]
        if (stringNode.type !== 'Literal') return;
        const string = stringNode.value
        const params = {}
        const paramsNode = node.arguments[1]
        if (paramsNode && paramsNode.type === 'ObjectExpression') {
          for (const prop of paramsNode.properties) {
            if (prop.key.type === 'Identifier' && prop.value.type === 'Literal') {
              params[prop.key.name] = prop.value.value
            }
          }
        }
        const partial = createPayload(string, params, relativeFile, options);
        if (!isPayloadValid(partial, options)) return;
        mergePayload(HASHES, {
          [partial.key]: {
            string: partial.string,
            meta: partial.meta,
          },
        });
      }
    }
  })
}

module.exports = {
  extractSveltePhrases,
};
