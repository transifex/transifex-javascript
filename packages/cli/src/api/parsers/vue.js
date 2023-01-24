const _ = require('lodash');
const vueTemplateCompiler = require('@vue/compiler-sfc');
const { createPayload, isPayloadValid } = require('./utils');
const { mergePayload } = require('../merge');
const { babelExtractPhrases } = require('./babel');

/**
 * A function to traverse the AST provided by the vue/compiler-sfc package
 *
 * @param {*} ast
 * @param {*} visitor
 */
function traverseVueTemplateAst(ast, visitor = {}) {
  // Use this in order to identify expressions in the AST since there is no
  // Tag to identify it with when traversing
  const VISITORS = {
    5: 'Expression',
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
    if (visitor[VISITORS[node.type]] && node.content) {
      if (node.content.loc.source) visitor[VISITORS[node.type]](node, parent);
    }
    if (node.children) traverseArray(node.children, node);
    if (node.content) {
      if (node.content.children) traverseArray(node.content.children, node);
      traverseNode(node.content, node);
    }
    // Take care of template conditions
    if (node.branches) {
      if (node.branches.length) {
        node.branches.forEach((element) => {
          traverseArray(element.children, element);
        });
      }
    }
    // Take care of props
    if (node.props) {
      if (node.props.length) {
        node.props.forEach((element) => {
          if (element.exp && element.exp.type === 8) {
            visitor.PropsExpression(element, node);
          }
        });
      }
    }
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
    _.each(node.props, (attr) => {
      const property = attr.name;
      if (!property || !attr.value) return;

      const attrValue = attr.value.content;

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
  const vueContent = vueTemplateCompiler.parse(source);
  // Get the JS Content from the file and extract hashes/phrases with Babel
  if (vueContent.descriptor.script && vueContent.descriptor.script.content) {
    const script = vueContent.descriptor.script.content;
    babelExtractPhrases(HASHES, script, relativeFile, options);
  }

  // Get the template content from the file and extract hashes/phrases with
  // custom traverse function
  if (vueContent.descriptor.template && vueContent.descriptor.template.content) {
    // Compile to get the AST
    const template = vueTemplateCompiler.compileTemplate({
      id: 'sfc-compiler',
      source: vueContent.descriptor.template.content,
    });

    traverseVueTemplateAst(template.ast, {
      PropsExpression(node) {
        // Complex props might cause unrelated errors in Babel
        try {
          babelExtractPhrases(HASHES, node.exp.loc.source, relativeFile, options);
        // eslint-disable-next-line no-empty
        } catch (e) {}
      },
      Expression(node) {
        babelExtractPhrases(HASHES, node.content.loc.source, relativeFile, options);
      },
      T: vueElementVisitor(HASHES, relativeFile, options),
      UT: vueElementVisitor(HASHES, relativeFile, options),
    });
  }
}

module.exports = {
  extractVuePhrases,
};
