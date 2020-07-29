const _ = require('lodash');

/**
 * Convert a comma separated string to array of strings
 *
 * @param {String} string
 * @returns {String[]}
 */
function stringToArray(string) {
  string = (string || '').toString().trim(); // eslint-disable-line
  if (!string) return [];
  return _.compact(_.map(string.split(','), (entry) => entry.trim()));
}

/**
 * Merge arrays and remove duplicate values
 *
 * @param {Array} array1
 * @param {Array} array2
 * @returns
 */
function mergeArrays(array1, array2) {
  return _.uniq(_.concat(array1 || [], array2 || []));
}

module.exports = {
  stringToArray,
  mergeArrays,
};
