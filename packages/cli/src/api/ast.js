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

module.exports = { getPath };
