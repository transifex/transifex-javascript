/* globals __VERSION__, __PLATFORM__ */
import axios from 'axios';
import MessageFormat from 'messageformat';

import MemoryCache from './cache/MemoryCache';
import SourceErrorPolicy from './policies/SourceErrorPolicy';
import SourceStringPolicy from './policies/SourceStringPolicy';
import {
  generateKey, isString, isPluralized, escape,
} from './utils';
import {
  sendEvent,
  FETCHING_TRANSLATIONS, TRANSLATIONS_FETCHED, TRANSLATIONS_FETCH_FAILED,
  FETCHING_LOCALES, LOCALES_FETCHED, LOCALES_FETCH_FAILED,
  LOCALE_CHANGED,
} from './events';

const MF = new MessageFormat();

/**
 * Native instance, combines functionality from
 * NativeCore and LangState classes.
 *
 * @export
 * @class TxNative
 */
export default class TxNative {
  constructor() {
    this.cdsHost = 'https://cds.svc.transifex.net';
    this.token = '';
    this.secret = '';
    this.cache = new MemoryCache();
    this.missingPolicy = new SourceStringPolicy();
    this.errorPolicy = new SourceErrorPolicy();
    this.currentLocale = '';
    this.locales = [];
    this.languages = [];
  }

  /**
   * Initialize Native instance
   *
   * @param {Object} params
   * @param {String} params.cdsHost
   * @param {String} params.token
   * @param {String} params.secret
   * @param {Function} params.cache
   * @param {Function} params.missingPolicy
   * @param {Function} params.errorPolicy
   */
  init(params) {
    const that = this;

    [
      'cdsHost',
      'token',
      'secret',
      'cache',
      'missingPolicy',
      'errorPolicy',
      'currentLocale',
    ].forEach((value) => {
      if (params[value] !== undefined) {
        that[value] = params[value];
      }
    });
  }

  /**
   * Translate string in current language
   *
   * @param {String} sourceString
   * @param {Object} params
   * @param {String} params._context - Source context, affects key generation
   * @param {String} params._comment - Developer comment
   * @param {Number} params._charlimit - Character limit
   * @param {String} params._tags - Comma separated list of tags
   * @param {String} params._key - Custom key
   * @param {Boolean} params._escapeVars - If true escape ICU variables
   * @returns {String}
   */
  translate(sourceString, params) {
    try {
      const pluralized = isPluralized(sourceString);
      const key = generateKey(sourceString, params);
      let translation = this.cache.get(key, this.currentLocale);

      if (translation && pluralized && translation.startsWith('{???')) {
        const variableName = sourceString
          .substring(1, sourceString.indexOf(','))
          .trim();
        translation = `{${variableName}${translation.substring(4)}`;
      }

      let isMissing = false;
      if (!translation) {
        isMissing = true;
        translation = sourceString;
      }

      const msg = MF.compile(translation);
      if (params && params._escapeVars) {
        const safeParams = {};
        Object.keys(params).forEach((property) => {
          const value = params[property];
          safeParams[property] = isString(value) ? escape(value) : value;
        });
        translation = msg(safeParams);
      } else {
        translation = msg(params);
      }

      if (isMissing && this.currentLocale) {
        translation = this.missingPolicy.handle(translation, this.currentLocale);
      }

      if (!isString(translation)) translation = `${translation}`;
      return translation;
    } catch (err) {
      return this.errorPolicy.handle(err,
        `${sourceString}`, this.currentLocale, params);
    }
  }

  /**
   * Fetch locale translations from CDS
   *
   * @param {String} localeCode
   * @param {Object} params
   * @param {Boolean} params.refresh - Force re-fetching of content
   * @returns {Promise}
   */
  async fetchTranslations(localeCode, params = {}) {
    const refresh = !!params.refresh;
    if (!refresh && this.cache.hasTranslations(localeCode)) {
      return;
    }

    // contact CDS
    try {
      sendEvent(FETCHING_TRANSLATIONS, localeCode, this);
      let response;
      let lastResponseStatus = 202;
      while (lastResponseStatus === 202) {
        /* eslint-disable no-await-in-loop */
        response = await axios.get(`${this.cdsHost}/content/${localeCode}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'X-NATIVE-SDK': `txjs/${__PLATFORM__}/${__VERSION__}`,
          },
        });
        /* eslint-enable no-await-in-loop */
        lastResponseStatus = response.status;
      }

      const { data } = response;
      if (data && data.data) {
        const hashmap = {};
        Object.keys(data.data).forEach((key) => {
          if (data.data[key].string) {
            hashmap[key] = data.data[key].string;
          }
        });
        this.cache.update(localeCode, hashmap);
        sendEvent(TRANSLATIONS_FETCHED, localeCode, this);
      } else {
        sendEvent(TRANSLATIONS_FETCH_FAILED, localeCode, this);
        throw new Error('Could not fetch translations');
      }
    } catch (err) {
      sendEvent(TRANSLATIONS_FETCH_FAILED, localeCode, this);
      throw err;
    }
  }

  /**
   * Get remote project locales from CDS
   *
   * @param {Object} params
   * @param {Boolean} params.refresh - Force re-fetching of content
   * @returns {Promise<String[]>}
   */
  async getLocales(params = {}) {
    const refresh = !!params.refresh;

    if (!refresh && this.locales.length > 0) {
      return [...this.locales];
    }

    if (!this.token) return [];

    // contact CDS
    try {
      sendEvent(FETCHING_LOCALES, null, this);
      let response;
      let lastResponseStatus = 202;
      while (lastResponseStatus === 202) {
        /* eslint-disable no-await-in-loop */
        response = await axios.get(`${this.cdsHost}/languages`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'X-NATIVE-SDK': `txjs/${__PLATFORM__}/${__VERSION__}`,
          },
        });
        /* eslint-enable no-await-in-loop */
        lastResponseStatus = response.status;
      }

      const { data } = response;
      if (data && data.data) {
        this.languages = data.data;
        this.locales = this.languages.map((entry) => entry.code);
        sendEvent(LOCALES_FETCHED, null, this);
      } else {
        sendEvent(LOCALES_FETCH_FAILED, null, this);
        throw new Error('Could not fetch languages');
      }
    } catch (err) {
      sendEvent(LOCALES_FETCH_FAILED, null, this);
      throw err;
    }

    return [...this.locales];
  }

  /**
   * Get currently selected locale
   *
   * @returns {String}
   */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /**
   * Check if a locale is the currently selected one
   *
   * @param {String} localeCode
   * @returns {Boolean}
   */
  isCurrent(localeCode) {
    return localeCode === this.currentLocale;
  }

  /**
   * Set current locale for translating content
   *
   * @param {String} localeCode
   * @returns {Promise}
   */
  async setCurrentLocale(localeCode) {
    if (this.isCurrent(localeCode)) return;
    if (!localeCode) {
      this.currentLocale = '';
      sendEvent(LOCALE_CHANGED, this.currentLocale, this);
      return;
    }
    await this.fetchTranslations(localeCode);
    this.currentLocale = localeCode;
    sendEvent(LOCALE_CHANGED, localeCode, this);
  }

  /**
   * Set detailed list of supported languages, useful for creating
   * language pickers
   *
   * @param {Object} params
   * @param {Boolean} params.refresh - Force re-fetching of content
   * @returns {Promise<Language[]>}
   * @returns {String} Language.name
   * @returns {String} Language.code
   * @returns {String} Language.localized_name
   * @returns {Boolean} Language.rtl
   */
  async getLanguages(params = {}) {
    await this.getLocales(params);
    return [...this.languages];
  }
}
