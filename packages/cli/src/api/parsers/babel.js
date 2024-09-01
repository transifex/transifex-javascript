const babelParser = require('@babel/parser');
const babelTraverse = require('@babel/traverse').default;
const _ = require('lodash');
const { mergePayload } = require('../merge');
const {
  isTransifexCall, findDeclaredValue, createPayload, isPayloadValid,
} = require('./utils');

function babelParse(source) {
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

/*  Converts a list of JSX AST nodes to a string. Each "tag" must be converted
  * to a numbered tag in the order they were encountered in and all props must
  * be stripped.
  *
  *   const root = babelParse('<><one two="three">four<five six="seven" /></one></>');
  *   const children = root.program.body[0].expression.children;
  *   const [result] = toStr(children)
  *   console.log(result.join(''));
  *   // <<< '<1>four<2/></1>'
  *
  * The second argument and return value are there because of how recursion
  * works. For high-level invocation you won't have to worry about them.
  * */
function toStr(children, counter = 0) {
  if (!children) { return [[], 0]; }

  let result = [];

  let actualCounter = counter;
  for (let i = 0; i < children.length; i += 1) {
    const child = children[i];
    if (child.type === 'JSXElement') {
      actualCounter += 1;
      if (child.children && child.children.length > 0) {
        // child has children, recursively run 'toStr' on them
        const [newResult, newCounter] = toStr(child.children, actualCounter);
        if (newResult.length === 0) { return [[], 0]; }
        result.push(`<${actualCounter}>`); //  <4>
        result = result.concat(newResult); //  <4>...
        result.push(`</${actualCounter}>`); // <4>...</4>
        // Take numbered tags that were found during the recursion into account
        actualCounter = newCounter;
      } else {
        // child has no children of its own, replace with something like '<4/>'
        result.push(`<${actualCounter}/>`);
      }
    } else if (child.type === 'JSXText') {
      // Child is not a React element, append as-is
      let chunk = child.value;

      // Try to mimic how JSX is parsed in runtime React
      const [startMatch] = /^[\s\n]*/.exec(child.value);
      if (startMatch.includes('\n')) {
        chunk = chunk.substring(startMatch.length);
      }

      const [endMatch] = /[\s\n]*$/.exec(child.value);
      if (endMatch.includes('\n')) {
        chunk = chunk.substring(0, chunk.length - endMatch.length);
      }

      if (chunk) { result.push(chunk); }
    } else if (
      child.type === 'JSXExpressionContainer'
      && child.expression.type === 'StringLiteral'
    ) {
      const chunk = child.expression.value;
      if (chunk) { result.push(chunk); }
    } else {
      return [[], 0];
    }
  }
  return [result, actualCounter];
}

function babelExtractPhrases(HASHES, source, relativeFile, options) {
  const ast = babelParse(source);
  babelTraverse(ast, {
    // T / UT functions
    CallExpression({ node, scope }) {
      // Check if node is a Transifex function
      if (!isTransifexCall(node)) return;
      if (_.isEmpty(node.arguments)) return;

      // Try to find the value of first argument

      const string = findDeclaredValue(scope, node.arguments[0]);

      // Verify that at least the string is passed to the function
      if (!_.isString(string)) return;

      // Extract function parameters
      const params = {};
      if (
        node.arguments[1]
        && node.arguments[1].type === 'ObjectExpression'
      ) {
        _.each(node.arguments[1].properties, (prop) => {
          // get only string on number params
          const value = findDeclaredValue(scope, prop.value);
          if (_.isString(value) || _.isNumber(value)) {
            params[prop.key.name] = value;
          }
        });
      }

      const partial = createPayload(string, params, relativeFile, options);
      if (!isPayloadValid(partial, options)) return;

      mergePayload(HASHES, {
        [partial.key]: {
          string: partial.string,
          meta: partial.meta,
        },
      });
    },

    // Supported SDK Decorators
    Decorator({ node }) {
      const elem = node.expression;

      if (!elem || !elem.arguments || !elem.arguments.length) return;

      // Angular SDK T Decorator
      if (node && node.expression && node.expression.callee
        && node.expression.callee.name === 'T') {
        let string = '';
        let key = '';
        const params = {};
        _.each(node.expression.arguments, (arg) => {
          if (arg.type === 'StringLiteral') {
            string = arg.value;
          } else if (arg.type === 'ObjectExpression') {
            _.each(arg.properties, (prop) => {
              if (prop.key.name === '_key') {
                key = prop.value.value;
              } else {
                params[prop.key.name] = prop.value.value;
              }
            });
          }
        });

        if (string) {
          const partial = createPayload(string, params, relativeFile, options);
          if (!isPayloadValid(partial, options)) return;

          mergePayload(HASHES, {
            [key || partial.key]: {
              string: partial.string,
              meta: partial.meta,
            },
          });
        }
      }
    },

    // React component
    JSXElement({ node, scope }) {
      const elem = node.openingElement;

      if (!elem || !elem.name) return;
      if (elem.name.name !== 'T' && elem.name.name !== 'UT') return;

      let string;
      const params = {};
      _.each(elem.attributes, (attr) => {
        const property = attr.name && attr.name.name;
        if (!property || !attr.value) return;

        const attrValue = findDeclaredValue(scope, attr.value);
        if (!attrValue) return;

        if (property === '_str') {
          string = attrValue;
          return;
        }
        params[property] = attrValue;
      });

      if (!string && elem.name.name === 'T' && node.children && node.children.length) {
        const [result] = toStr(node.children);
        string = result.join('');
      }

      if (!string) return;

      const partial = createPayload(string, params, relativeFile, options);
      if (!isPayloadValid(partial, options)) return;

      mergePayload(HASHES, {
        [partial.key]: {
          string: partial.string,
          meta: partial.meta,
        },
      });
    },
  });
}

module.exports = {
  babelExtractPhrases,
  babelParse,
};
