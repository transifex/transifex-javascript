import MessageFormat from 'messageformat';
import { generateKey, escapeHtml, isString } from './utils';
import { getTranslation } from './cache';
import { getSelectedLanguage } from './state';
import { fallbackTranslation, handleError } from './fallback';

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
  try {
    const key = generateKey(string, options);

    let translation =
      getTranslation(getSelectedLanguage(), key);

    let isMissing = false;
    if (!translation) {
      isMissing = true;
      translation = string;
    }

    const msg = MF.compile(translation);
    if (options && !options._safe) {
      const params = {};
      Object.keys(options).forEach(property => {
        const value = options[property];
        params[property] = isString(value) ? escapeHtml(value) : value;
      });
      translation = msg(params);
    } else {
      translation = msg(options);
    }

    if (isMissing) {
      translation = fallbackTranslation(translation);
    }

    return translation;
  } catch (err) {
    return handleError(err, string);
  }
}
