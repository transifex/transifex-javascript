import md5 from 'md5';

/**
 * Generate a string key
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} key
 */
export function generateKey(string, options={}) {
  if (options._key) return options._key;

  let context = '';
  if (options._context) {
    context = options._context;
    context = context.replace(/,/g, ':');
  }
  return md5(`5:${string}:${context}`);
}

/**
 * Escape HTML string
 *
 * @export
 * @param {String} unsafe
 * @returns {String} safe
 */
export function escapeHtml(unsafe) {
  return unsafe.
    replace(/&/g, '&amp;').
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;').
    replace(/"/g, '&quot;').
    replace(/'/g, '&#039;');
}

/**
 * Check if passed parameter is String
 *
 * @export
 * @param {*} obj
 * @returns {Boolean}
 */
export function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}
