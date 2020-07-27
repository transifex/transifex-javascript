export const FETCHING_TRANSLATIONS = 'FETCHING_TRANSLATIONS';
export const TRANSLATIONS_FETCHED = 'TRANSLATIONS_FETCHED';
export const TRANSLATIONS_FETCH_FAILED = 'TRANSLATIONS_FETCH_FAILED';
export const LOCALE_CHANGED = 'LOCALE_CHANGED';
export const FETCHING_LOCALES = 'FETCHING_LOCALES';
export const LOCALES_FETCHED = 'LOCALES_FETCHED';
export const LOCALES_FETCH_FAILED = 'LOCALES_FETCH_FAILED';

const EVENTS = {};

/**
 * Listen for event
 *
 * @export
 * @param {String} type
 * @param {Function} fn
 */
export function onEvent(type, fn) {
  EVENTS[type] = EVENTS[type] || [];
  EVENTS[type].push(fn);
}

/**
 * Stop listening for event
 *
 * @export
 * @param {String} type
 * @param {Function} fn
 */
export function offEvent(type, fn) {
  const array = EVENTS[type] || [];
  const index = array.indexOf(fn);
  if (index !== -1) array.splice(index, 1);
}

/**
 * Send an event to all listeners
 *
 * @export
 * @param {String} type
 * @param {*} payload
 * @param {Object} caller
 */
export function sendEvent(type, payload, caller) {
  (EVENTS[type] || []).forEach((fn) => {
    fn(payload, caller);
  });
}
