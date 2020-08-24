import axios from 'axios';
import MessageFormat from 'messageformat';

import MemoryCache from './cache/MemoryCache';
import SourceErrorPolicy from './policies/SourceErrorPolicy';
import SourceStringPolicy from './policies/SourceStringPolicy';
import { generateKey, isString, escape } from './utils';
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
    this.sourceLocale = '';
    this.currentLocale = '';
    this.appLocales = [];
    this.remoteLocales = [];
    this.remoteLanguages = [];
  }

  /**
   * Initialize Native instance
   *
   * @param {Object} params
   * @param {String} params.sourceLocale
   * @param {String[]} params.appLocales
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
      'sourceLocale',
      'currentLocale',
      'appLocales',
    ].forEach((value) => {
      if (params[value] !== undefined) {
        that[value] = params[value];
      }
    });

    if (!this.currentLocale) {
      this.currentLocale = this.sourceLocale;
    }
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
      const key = generateKey(sourceString, params);
      let translation = this.cache.get(key, this.currentLocale);

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

      if (isMissing) {
        translation = this.missingPolicy.handle(translation, this.currentLocale);
      }

      return translation;
    } catch (err) {
      return this.errorPolicy.handle(err, sourceString, this.currentLocale, params);
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
      const response = await axios.get(`${this.cdsHost}/content/${localeCode}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

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
   * Get locales that were defined in the app settings through
   * tx.init(..)
   *
   * @returns {String[]} - Array of locales
   */
  getAppLocales() {
    return this.appLocales;
  }

  /**
   * Get remote project locales from CDS
   *
   * @param {Object} params
   * @param {Boolean} params.refresh - Force re-fetching of content
   * @returns {Promise<String[]>}
   */
  async getRemoteLocales(params = {}) {
    const refresh = !!params.refresh;

    if (!refresh && this.remoteLocales.length > 0) {
      return this.remoteLocales;
    }

    if (!this.token) return [];

    // contact CDS
    try {
      sendEvent(FETCHING_LOCALES, null, this);
      const response = await axios.get(`${this.cdsHost}/languages`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const { data } = response;
      if (data && data.data) {
        this.remoteLanguages = data.data;
        this.remoteLocales = this.remoteLanguages.map((entry) => entry.code);
        sendEvent(LOCALES_FETCHED, null, this);
      } else {
        sendEvent(LOCALES_FETCH_FAILED, null, this);
        throw new Error('Could not fetch languages');
      }
    } catch (err) {
      sendEvent(LOCALES_FETCH_FAILED, null, this);
      throw err;
    }

    return this.remoteLocales;
  }

  /**
   * Get a list of supported locales that are both in the remote project
   * AND defined in app settings. If no locales are defined in app settings (tx.init)
   * then return all remote project locales.
   *
   * @param {Object} params
   * @param {Boolean} params.refresh - Force re-fetching of content
   * @returns {Promise<String[]>}
   */
  async getSupportedLocales(params) {
    const remote = await this.getRemoteLocales(params);
    const app = this.getAppLocales();
    if (!app.length) {
      return remote;
    }
    // return intersection of remote and app
    return remote.filter((value) => app.includes(value));
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
   * Check if a locale code is the source locale
   *
   * @param {String} localeCode
   * @returns {Boolean}
   */
  isSource(localeCode) {
    return localeCode === this.sourceLocale;
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
    if (this.isSource(localeCode)) {
      this.currentLocale = localeCode;
      sendEvent(LOCALE_CHANGED, localeCode, this);
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
   * @returns {Promise<Language[]>}
   * @returns {String} Language.name
   * @returns {String} Language.code
   * @returns {String} Language.localized_name
   * @returns {Boolean} Language.rtl
   */
  async getLanguages() {
    const supported = await this.getSupportedLocales();
    return this.remoteLanguages.filter((entry) => supported.includes(entry.code));
  }
}
