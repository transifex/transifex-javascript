import MessageFormat from 'messageformat';
import { generateKey, escapeHtml } from './utils';
import { getTranslation } from './storage';
import { getLanguage } from './state';
import { fallbackTranslation } from './fallback';

const MF = new MessageFormat();

/**
 * Translate string (Unescaped HTML version)
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} translation
 */
export function ut(string, options) {
  const key = generateKey(string, options);

  let translation =
    getTranslation(getLanguage(), key);

  let isMissing = false;
  if (!translation) {
    isMissing = true;
    translation = string;
  }

  const msg = MF.compile(translation);
  if (options && !options._safe) {
    const params = {};
    Object.keys(options).forEach(property => {
      params[property] = escapeHtml(options[property]);
    });
    translation = msg(params);
  } else {
    translation = msg(options);
  }

  if (isMissing) {
    translation = fallbackTranslation(translation);
  }

  return translation;
}
