const svelte = require('svelte/compiler');
const { createPayload, isPayloadValid, isTransifexCall } = require('./utils');
const { mergePayload } = require('../merge');

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
  svelte.walk(svelteContent, {
    enter(node, parent, prop, index) {
      if (isTransifexCall(node)) {
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
