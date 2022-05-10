import md5 from 'md5';

/**
 * Generate a string key
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} key
 */
export function generateKey(string, options = {}) {
  if (options._key) return options._key;

  if (options._context) {
    return `${string}::${options._context}`;
  }

  // ensure string is returned
  return `${string}`;
}

/**
 * Generate a hashed based string key
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} key
 */
export function generateHashedKey(string, options = {}) {
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
export function escape(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

/**
 * Convert a locale to Transifex locale format, e.g
 * pt-br -> pt_BR
 *
 * @export
 * @param {String} locale
 * @returns {String} normalizedLocale
 */
export function normalizeLocale(locale) {
  const parts = locale.split('-');
  let normalizedLocale;
  if (parts.length === 1) {
    normalizedLocale = locale;
  } else {
    normalizedLocale = [parts[0], parts[1].toUpperCase()].join('_');
  }
  return normalizedLocale;
}

/**
 * Sleep in msec
 *
 * @export
 * @param {Number} msec
 */
export function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
}
