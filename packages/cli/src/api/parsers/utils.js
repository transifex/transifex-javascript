/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');
const { generateKey, generateHashedKey } = require('@transifex/native');
const { stringToArray, mergeArrays } = require('../utils');
/**
 * Find value bound to some identifier with passed name.
 *
 * @param {Object} scope AST Scope to use for lookup.
 * @param {String} name Name of the identifier.
 * @returns {String?} declared value or null.
 */
function findIdentifierValue(scope, name) {
  if (!scope) return null;

  if (scope.bindings[name]) {
    const binding = scope.bindings[name];

    if (binding.kind !== 'const') return null;
    const { node } = binding.path;

    if (node.type === 'VariableDeclarator' && node.init) {
      // eslint-disable-next-line no-use-before-define
      return findDeclaredValue(scope, node.init);
    }
  }

  if (scope.path.parentPath) {
    return findIdentifierValue(scope.path.parentPath.scope, name);
  }

  return null;
}

/**
   * Find declared value bound to identifier defined in init.
   *
   * @param {Object} scope AST Scope to use for lookup.
   * @param {Object} init AST Node to work with.
   * @returns {String?} declared value or null.
   */
function findDeclaredValue(scope, init) {
  if (!init) return null;

  if (init.type === 'StringLiteral') {
    return init.value;
  }

  if (init.type === 'NumericLiteral') {
    return init.value;
  }

  if (init.type === 'JSXExpressionContainer') {
    return findDeclaredValue(scope, init.expression);
  }

  if (init.type === 'Identifier') {
    return findIdentifierValue(scope, init.name);
  }

  if (init.type === 'BinaryExpression' && init.operator === '+') {
    const left = findDeclaredValue(scope, init.left);
    const right = findDeclaredValue(scope, init.right);

    if (_.isString(left) && _.isString(right)) {
      return left + right;
    }
  }

  if (init.type === 'TemplateLiteral') {
    const expressions = init.expressions.map((node) => findDeclaredValue(scope, node));
    if (expressions.includes(null)) return null;

    const elements = init.quasis.flatMap(
      ({ tail, value }, i) => (tail ? value.raw : [value.raw, expressions[i]]),
    );
    return elements.join('');
  }

  return null;
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

  let fnName;
  if (callee.type === 'MemberExpression'
    && callee.property.type === 'Identifier') {
    fnName = callee.property.name;
  } else if (callee.type === 'Identifier') {
    fnName = callee.name;
  } else {
    return false;
  }

  if (_.includes(['t', 'ut', '$t'], fnName)) { return true; }
  if (!callee.object || !callee.property) return false;
  if (callee.property.name === 'translate') return true;
  return false;
}

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
 * @param {Object} options
 */
function createPayload(string, params, occurence, options = {}) {
  return {
    string,
    key: options.useHashedKeys
      ? generateHashedKey(string, params)
      : generateKey(string, params),
    meta: _.omitBy({
      context: stringToArray(params._context || params.context),
      developer_comment: params._comment || params.comment,
      character_limit: params._charlimit || params.charlimit
        ? parseInt(params._charlimit || params.charlimit, 10)
        : undefined,
      tags: mergeArrays(stringToArray(params._tags || params.tags), options.appendTags),
      occurrences: [occurence],
    }, _.isNil),
  };
}

module.exports = {
  findIdentifierValue,
  findDeclaredValue,
  isPayloadValid,
  isTransifexCall,
  createPayload,
};
