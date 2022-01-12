const _ = require('lodash');
const vueTemplateCompiler = require('vue-template-compiler');
const { createPayload, isPayloadValid } = require('./utils');
const { mergePayload } = require('../merge');
const { babelExtractPhrases } = require('./babel');

/**
 * A function to traverse the AST provided by the vue-template-compiler package
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
function extractVuePhrases(HASHES, source, relativeFile, options) {
  // Use the vue-template-compiler API to parse content
  const vueContent = vueTemplateCompiler.parseComponent(source);

  // Get the JS Content from the file and extract hashes/phrases with Babel
  if (vueContent.script && vueContent.script.content) {
    const script = vueContent.script.content;
    babelExtractPhrases(HASHES, script, relativeFile, options);
  }

  // Get the template content from the file and extract hashes/phrases with
  // custom traverse function
  if (vueContent.template && vueContent.template.content) {
    // Compile to get the AST
    const template = vueTemplateCompiler.compile(vueContent.template.content, {
      preserveWhitespace: false,
    });

    traverseVueTemplateAst(template.ast, {
      Expression(node) {
        babelExtractPhrases(HASHES, node.expression, relativeFile, options);
      },
      T: vueElementVisitor(HASHES, relativeFile, options),
      UT: vueElementVisitor(HASHES, relativeFile, options),
    });
  }
}

module.exports = {
  extractVuePhrases,
};
