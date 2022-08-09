const svelte = require('svelte/compiler');
const { createPayload, isPayloadValid, isTransifexCall } = require('./utils');
const { mergePayload } = require('../merge');

function findDeclaredValue(node) {
  if (!init) return null;

  // For now, only literals are supported in the Svelte parser.
  if (init.type === 'Literal') {
    return init.value;
  }

  return null;
}

/**
 * Parses the source with svelte package.
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
  const svelteContent = svelte.parse(source);
  svelte.walk(svelteContent, {
    enter(node, parent, prop, index) {
      if (isTransifexCall(node)) {
        const string = findDeclaredValue(node.arguments[0]);
        if (typeof string !== 'string') return;

        // Extract function parameters
        const params = {};
        if (
          node.arguments[1]
          && node.arguments[1].type === 'ObjectExpression'
        ) {
          for (const prop of node.arguments[1].properties) {
            // get only string or number params
            const value = findDeclaredValue(prop.value);
            if (typeof value === 'string' || typeof value === 'number') {
              params[prop.key.name] = value;
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
