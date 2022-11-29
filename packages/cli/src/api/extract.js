/* eslint no-underscore-dangle: 0 */

const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const pug = require('pug');

const { parseHTMLTemplateFile } = require('./parsers/angularHTML');
const { babelExtractPhrases } = require('./parsers/babel');
const { extractVuePhrases } = require('./parsers/vue');
const { extractI18NextPhrases } = require('./parsers/i18next');
const { extractTXNativeJSONPhrases } = require('./parsers/txnativejson');

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
 * @param {String} options.parser
 * @returns {Object}
 */
function extractPhrases(file, relativeFile, options = {}) {
  const HASHES = {};
  let source = fs.readFileSync(file, 'utf8');

  // i18next JSON
  if (options.parser === 'i18next') {
    extractI18NextPhrases(HASHES, source, relativeFile, options);
    return HASHES;
  }

  // Transifex Native JSON
  if (options.parser === 'txnativejson') {
    extractTXNativeJSONPhrases(HASHES, source, relativeFile, options);
    return HASHES;
  }

  // PUBG templates
  if (path.extname(file) === '.pug') {
    source = pug.compileClient(source);
    babelExtractPhrases(HASHES, source, relativeFile, options);
    return HASHES;
  }

  // EJS templates
  if (path.extname(file) === '.ejs') {
    const template = new ejs.Template(source);
    template.generateSource();
    source = template.source;
    babelExtractPhrases(HASHES, source, relativeFile, options);
    return HASHES;
  }

  // HTML templates
  if (path.extname(file) === '.html') {
    parseHTMLTemplateFile(HASHES, file, relativeFile, options);
    return HASHES;
  }

  // Vue templates
  if (path.extname(file) === '.vue') {
    extractVuePhrases(HASHES, source, relativeFile, options);
    return HASHES;
  }

  // default
  babelExtractPhrases(HASHES, source, relativeFile, options);
  return HASHES;
}

module.exports = {
  extractPhrases,
};
