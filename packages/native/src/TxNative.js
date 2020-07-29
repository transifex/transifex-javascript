import axios from 'axios';
import NativeCore from './NativeCore';
import LangState from './LangState';
import {
  sendEvent,
  FETCHING_TRANSLATIONS, TRANSLATIONS_FETCHED, TRANSLATIONS_FETCH_FAILED,
  FETCHING_LOCALES, LOCALES_FETCHED, LOCALES_FETCH_FAILED,
  LOCALE_CHANGED,
} from './events';

/**
 * Native instance, combines functionality from
 * NativeCore and LangState classes.
 *
 * @export
 * @class TxNative
 */
export default class TxNative {
  constructor() {
    this.core = new NativeCore();
    this.state = new LangState();
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

    // initialize core
    this.core.init(params);

    // initialize lang state
    [
      'sourceLocale',
      'appLocales',
    ].forEach((value) => {
      if (params[value] !== undefined) {
        that.state[value] = params[value];
      }
    });
    if (!this.state.currentLocale) {
      this.state.currentLocale = this.state.sourceLocale;
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
    return this.core.translate(sourceString, this.state.currentLocale, params);
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
    if (!refresh && this.core.cache.hasTranslations(localeCode)) {
      return;
    }

    // contact CDS
    try {
      sendEvent(FETCHING_TRANSLATIONS, localeCode, this);
      const response = await axios.get(`${this.core.cdsHost}/content/${localeCode}`, {
        headers: {
          Authorization: `Bearer ${this.core.token}`,
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
        this.core.cache.update(localeCode, hashmap);
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
    return this.state.appLocales;
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

    if (!refresh && this.state.remoteLocales.length > 0) {
      return this.state.remoteLocales;
    }

    if (!this.core.token) return [];

    // contact CDS
    try {
      sendEvent(FETCHING_LOCALES, null, this);
      const response = await axios.get(`${this.core.cdsHost}/languages`, {
        headers: {
          Authorization: `Bearer ${this.core.token}`,
        },
      });

      const { data } = response;
      if (data && data.data) {
        this.state.remoteLanguages = data.data;
        this.state.remoteLocales = this.state.remoteLanguages.map((entry) => entry.code);
        sendEvent(LOCALES_FETCHED, null, this);
      } else {
        sendEvent(LOCALES_FETCH_FAILED, null, this);
        throw new Error('Could not fetch languages');
      }
    } catch (err) {
      sendEvent(LOCALES_FETCH_FAILED, null, this);
      throw err;
    }

    return this.state.remoteLocales;
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
    return this.state.currentLocale;
  }

  /**
   * Set current locale for translating content
   *
   * @param {String} localeCode
   * @returns {Promise}
   */
  async setCurrentLocale(localeCode) {
    if (this.state.isCurrent(localeCode)) return;
    if (this.state.isSource(localeCode)) {
      this.state.currentLocale = localeCode;
      sendEvent(LOCALE_CHANGED, localeCode, this);
      return;
    }
    await this.fetchTranslations(localeCode);
    this.state.currentLocale = localeCode;
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
    return this.state.remoteLanguages.filter((entry) => supported.includes(entry.code));
  }
}
