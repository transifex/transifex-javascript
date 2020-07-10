const STORAGE = {};

/**
 * Store language translations
 *
 * @export
 * @param {String} langcode
 * @param {Object} data
 * {
 *    'hash': 'string',
 *    'hash': 'string',
 * }
 */
export function setTranslations(langcode, data) {
  STORAGE[langcode] = data;
}

/**
 * Get language translations
 *
 * @export
 * @param {String} langcode
 * @returns {Object}
 * {
 *    'hash': 'string',
 *    'hash': 'string',
 * }
 */
export function getTranslations(langcode) {
  return STORAGE[langcode] || {};
}

/**
 * Check if language translations are available
 *
 * @export
 * @param {String} langcode
 * @returns {Boolean}
 */
export function hasTranslations(langcode) {
  return !!STORAGE[langcode];
}

/**
 * Get translation by key
 *
 * @export
 * @param {String} langcode
 * @param {String} key
 * @returns {String} translation or empty string
 */
export function getTranslation(langcode, key) {
  return getTranslations(langcode)[key] || '';
}
