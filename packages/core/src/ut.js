import MessageFormat from 'messageformat';
import { generateKey, escapeHtml } from './utils';
import { getTranslation } from './storage';
import { getLanguage } from './state';

const MF = new MessageFormat();

/**
 * Translate string (Unescaped HTML version)
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} translation
 */
export default function ut(string, options) {
  const key = generateKey(string, options);

  let translation =
    getTranslation(getLanguage(), key);

  if (!translation) {
    // we can add missing policy here.
    // for now it's just source string replacement
    translation = string;
  }

  const msg = MF.compile(translation);
  if (options && !options._safe) {
    const params = {};
    Object.keys(options).forEach(property => {
      params[property] = escapeHtml(options[property]);
    });
    return msg(params);
  }
  return msg(options);
}
