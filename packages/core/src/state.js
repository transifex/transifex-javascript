import axios from 'axios';

import {
  getConfig,
  PROJECT_TOKEN,
  SOURCE_LANG_CODE,
  CDS_URL
} from './config';

import {
  sendEvent,
  LANGUAGE_CHANGED,
  FETCHING_CONTENT,
  CONTENT_FETCHED,
  CONTENT_FETCH_FAILED,
  FETCHING_LANGUAGES,
  LANGUAGES_FETCHED,
  LANGUAGES_FETCH_FAILED
} from './events';

import { hasTranslations, setTranslations } from './cache';

let SELECTED_LANG_CODE = '';
let ALL_LANGUAGES;

/**
 * Set language
 *
 * @export
 * @param {String} langcode
 * @returns {Promise}
 */
export async function setSelectedLanguage(langcode) {
  const parts = langcode.split('-');
  let processedLangcode;
  if (parts.length === 1) {
    processedLangcode = langcode;
  } else {
    processedLangcode = [parts[0], parts[1].toUpperCase()].join('_');
  }

  const projectToken = getConfig(PROJECT_TOKEN);
  const sourceLangCode = getConfig(SOURCE_LANG_CODE);

  if (SELECTED_LANG_CODE === processedLangcode) return;

  // check for source language
  if (processedLangcode === sourceLangCode) {
    SELECTED_LANG_CODE = processedLangcode;
    sendEvent(LANGUAGE_CHANGED, processedLangcode);
    return;
  }

  // check if we already have data
  if (hasTranslations(processedLangcode)) {
    SELECTED_LANG_CODE = processedLangcode;
    sendEvent(LANGUAGE_CHANGED, processedLangcode);
    return;
  }

  // contact CDS
  try {
    sendEvent(FETCHING_CONTENT, processedLangcode);
    const cdsUrl = getConfig(CDS_URL);
    const response = await axios.get(`${cdsUrl}/content/${processedLangcode}`, {
      headers: {
        'Authorization': `Bearer ${projectToken}`,
      },
    });

    const { data } = response;
    if (data && data.data) {
      const hashmap = {};
      Object.keys(data.data).forEach(key => {
        hashmap[key] = data.data[key].string || '';
      });
      setTranslations(processedLangcode, hashmap);
      sendEvent(CONTENT_FETCHED, processedLangcode);

      SELECTED_LANG_CODE = processedLangcode;
      sendEvent(LANGUAGE_CHANGED, processedLangcode);
    } else {
      sendEvent(CONTENT_FETCH_FAILED, processedLangcode);
    }
  } catch (err) {
    sendEvent(CONTENT_FETCH_FAILED, processedLangcode);
    throw err;
  }
}

/**
 * Return the selected language code
 *
 * @export
 * @returns {String} langcode
 */
export function getSelectedLanguage() {
  return SELECTED_LANG_CODE || getConfig(SOURCE_LANG_CODE);
}

/**
 * Fetch all available languages from CDS
 *
 * @export
 * @returns {Array} languages
 * @throws
 */
export async function getAvailableLanguages() {
  if (ALL_LANGUAGES) return ALL_LANGUAGES;

  const projectToken = getConfig(PROJECT_TOKEN);
  if (!projectToken) return [];

  // contact CDS
  try {
    sendEvent(FETCHING_LANGUAGES);
    const cdsUrl = getConfig(CDS_URL);
    const response = await axios.get(`${cdsUrl}/languages`, {
      headers: {
        'Authorization': `Bearer ${projectToken}`,
      },
    });

    const { data } = response;
    if (data && data.data) {
      ALL_LANGUAGES = data.data;
      sendEvent(LANGUAGES_FETCHED);
    } else {
      sendEvent(LANGUAGES_FETCH_FAILED);
      throw new Error('Could not fetch languages');
    }
  } catch (err) {
    sendEvent(LANGUAGES_FETCH_FAILED);
    throw err;
  }

  return ALL_LANGUAGES;
}
