import {
  getConfig,
  MISSING_POLICY,
  MISSING_POLICY_PSEUDO,
  SOURCE_LANG_CODE
} from './config';
import pseudo from './pseudo';
import { getLanguage } from './state';

/**
 * Get a fallback string based on missing policy
 *
 * @export
 * @param {String} string
 * @returns {String}
 */
export function fallbackTranslation(string) {
  // check if we are on source language
  if (getConfig(SOURCE_LANG_CODE) === getLanguage()) {
    return string;
  }

  switch(getConfig(MISSING_POLICY)) {
    case MISSING_POLICY_PSEUDO:
      return pseudo(string);
    default:
      return string;
  }
}
