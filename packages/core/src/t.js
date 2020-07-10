import MessageFormat from 'messageformat';
import { generateKey, escapeHtml } from './utils';
import { getTranslation } from './cache';
import { getSelectedLanguage } from './state';
import { fallbackTranslation, handleError } from './fallback';

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
    translation = msg(options);

    if (isMissing) {
      translation = fallbackTranslation(translation)
    }

    return escapeHtml(translation);
  } catch (err) {
    return handleError(err, string);
  }
}
