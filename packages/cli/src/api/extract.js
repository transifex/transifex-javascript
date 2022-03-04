/* eslint no-underscore-dangle: 0 */

const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const pug = require('pug');

const { parseHTMLTemplateFile } = require('./parsers/angularHTML');
const { babelExtractPhrases } = require('./parsers/babel');
const { extractVuePhrases } = require('./parsers/vue');

/**
 * Parse file and extract phrases using AST
 *
 * @param {String} file absolute file path
 * @param {String} relativeFile occurence
 * @param {Object} options
 * @param {String[]} options.appendTags
 * @param {String[]} options.filterWithTags
 * @param {String[]} options.filterWithoutTags
 * @param {Boolean} options.useHashedKeys
 * @returns {Object}
 */
function extractPhrases(file, relativeFile, options = {}) {
  const HASHES = {};
  let source = fs.readFileSync(file, 'utf8');

  // Handle simple templates that compile to javascript
  if (path.extname(file) === '.pug') {
    source = pug.compileClient(source);
  } else if (path.extname(file) === '.ejs') {
    const template = new ejs.Template(source);
    template.generateSource();
    source = template.source;
  }

  if (path.extname(file) === '.html') {
    parseHTMLTemplateFile(HASHES, file, relativeFile, options);
  } else if (path.extname(file) === '.vue') {
    extractVuePhrases(HASHES, source, relativeFile, options);
  } else if (path.extname(file) !== '.html') {
    babelExtractPhrases(HASHES, source, relativeFile, options);
  }

  return HASHES;
}

module.exports = {
  extractPhrases,
};
