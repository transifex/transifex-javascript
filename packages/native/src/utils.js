import md5 from 'md5';

const memoryStorage = {};

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
 * Detect if code is running in browser
 *
 * @export
 * @returns {Boolean}
 */
export function isBrowser() {
  return (
    typeof window !== 'undefined'
    // eslint-disable-next-line no-undef
    && typeof window.document !== 'undefined'
  );
}

/**
 * Detect if code is running in node
 *
 * @export
 * @returns {Boolean}
 */
export function isNode() {
  return (
    typeof process !== 'undefined'
    && process.versions != null
    && process.versions.node != null
  );
}

/**
 * Save to session storage (if supported)
 *
 * @export
 * @param {String} key
 * @param {Object} payload
 */
export function saveToSessionStorage(key, payload) {
  if (!isBrowser()) {
    memoryStorage[key] = payload;
    return;
  }

  // eslint-disable-next-line no-undef
  const storage = window.sessionStorage;
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    // no-op
  }
}

/**
 * Read from session storage (if supported)
 *
 * @export
 * @param {String} key
 * @returns {Object} - or null
 */
export function readFromSessionStorage(key) {
  if (!isBrowser()) {
    return memoryStorage[key] || null;
  }

  // eslint-disable-next-line no-undef
  const storage = window.sessionStorage;
  if (!storage) return null;

  try {
    const payload = storage.getItem(key);
    if (!payload) return null;
    return JSON.parse(payload);
  } catch (err) {
    return null;
  }
}
