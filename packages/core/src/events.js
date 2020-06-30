export const FETCHING_CONTENT = 'FETCHING_CONTENT';
export const CONTENT_FETCHED = 'CONTENT_FETCHED';
export const CONTENT_FETCH_FAILED = 'CONTENT_FETCH_FAILED';
export const LANGUAGE_CHANGED = 'LANGUAGE_CHANGED';
export const FETCHING_LANGUAGES = 'FETCHING_LANGUAGES';
export const LANGUAGES_FETCHED = 'LANGUAGES_FETCHED';
export const LANGUAGES_FETCH_FAILED = 'LANGUAGES_FETCH_FAILED';

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
 */
export function sendEvent(type, payload) {
  (EVENTS[type] || []).forEach(fn => {
    fn(payload);
  });
}
