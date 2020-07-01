import MessageFormat from 'messageformat';
import { generateKey, escapeHtml } from './utils';
import { getTranslation } from './storage';
import { getLanguage } from './state';

const MF = new MessageFormat();

/**
 * Translate string (Escaped)
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} escaped translation
 */
export function t(string, options) {
  const key = generateKey(string, options);

  let translation =
    getTranslation(getLanguage(), key);

  if (!translation) {
    // we can add missing policy here.
    // for now it's just source string replacement
    translation = string;
  }

  const msg = MF.compile(translation);
  return escapeHtml(msg(options));
}
