import {
  getConfig,
  MISSING_POLICY,
  MISSING_POLICY_PSEUDO,
  SOURCE_LANG_CODE,
  ERROR_POLICY,
  ERROR_POLICY_THROW
} from './config';
import pseudo from './pseudo';
import { getSelectedLanguage } from './state';

/**
 * Get a fallback string based on missing policy
 *
 * @export
 * @param {String} string
 * @returns {String}
 */
export function fallbackTranslation(string) {
  // check if we are on source language
  if (getConfig(SOURCE_LANG_CODE) === getSelectedLanguage()) {
    return string;
  }

  switch(getConfig(MISSING_POLICY)) {
    case MISSING_POLICY_PSEUDO:
      return pseudo(string);
    default:
      return string;
  }
}

/**
 * Get a fallback string based on error policy
 *
 * @export
 * @param {String} string
 * @returns {String}
 */
export function handleError(err, string) {
  switch(getConfig(ERROR_POLICY)) {
    case ERROR_POLICY_THROW:
      throw err || new Error('Error translating string');
    default:
      return string;
  }
}
