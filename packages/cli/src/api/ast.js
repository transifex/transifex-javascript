const _ = require('lodash');

/* Given an AST node of a CallExpression, return the path of the callee, or
 * `null` if none can be identified.
 *
 * Usage:
 *
 *   code = 'a.b.c("d")';
 *   node = babelParser.parse(code).program.body[0];
 *   console.log(getPath(node));
 *   // a.b.c
 *
 * Will return `null` if something weird is going on:
 *
 *   code = 'a[3].b("c")';
 *   node = babelParser.parse(code).program.body[0];
 *   console.log(getPath(node);)
 *   // null
 */
function getPath(node) {
  if (node.type !== 'CallExpression') { return null; }
  if (node.callee.type === 'Identifier') { return node.callee.name; }
  if (node.callee.type !== 'MemberExpression') { return null; }

  let ptr = node.callee;
  let path = [];
  while (ptr.type === 'MemberExpression') {
    if (ptr.property.type !== 'Identifier') { return null; }
    path.push(ptr.property.name);
    ptr = ptr.object;
  }
  if (ptr.type !== 'Identifier') { return null; }
  path.push(ptr.name);

  path = _.reverse(path);
  path = path.join('.');
  return path;
}

function _getArrayElements(node) {
  if (!node || node.type !== 'ArrayExpression') { return null; }
  let allStrings = true;
  const result = [];
  _.forEach(node.elements, (element) => {
    if (element.type === 'StringLiteral') {
      result.push(element.value);
    } else {
      allStrings = false;
      return false;
    }
    return true;
  });
  if (!allStrings) { return null; }
  return result;
}

/* Extract function parameters */
function getParams(node) {
  const result = {};
  if (node && node.type === 'ObjectExpression') {
    _.forEach(node.properties, (prop) => {
      // get only string on number params
      if (_.isString(prop.value.value) || _.isNumber(prop.value.value)) {
        result[prop.key.name] = prop.value.value;
      }
      const array = _getArrayElements(prop.value);
      if (array) { result[prop.key.name] = array; }
    });
  }
  return result;
}

function getJSXParams(node) {
  const result = {};
  _.forEach(node, (attr) => {
    const property = _.get(attr, 'name.name');
    if (!property) { return; }
    const value = _.get(attr, 'value.value');
    if (_.isString(value) || _.isNumber(value)) {
      result[property] = value;
    } else {
      const elements = _.get(attr, 'value.expression');
      const arrayValue = _getArrayElements(elements);
      if (arrayValue) { result[property] = arrayValue; }
    }
  });
  return result;
}

module.exports = { getPath, getParams, getJSXParams };
