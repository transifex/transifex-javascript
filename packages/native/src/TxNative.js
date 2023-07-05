/* globals __VERSION__, __PLATFORM__ */

import axios from 'axios';

import MemoryCache from './cache/MemoryCache';
import SourceErrorPolicy from './policies/SourceErrorPolicy';
import SourceStringPolicy from './policies/SourceStringPolicy';
import MessageFormatRenderer from './renderers/MessageFormatRenderer';
import {
  generateKey, isString, escape, generateHashedKey, sleep,
} from './utils';
import {
  sendEvent,
  FETCHING_TRANSLATIONS, TRANSLATIONS_FETCHED, TRANSLATIONS_FETCH_FAILED,
  FETCHING_LOCALES, LOCALES_FETCHED, LOCALES_FETCH_FAILED,
  LOCALE_CHANGED,
} from './events';
import { isPluralized } from './plurals';

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
    this.filterTags = '';
    this.filterStatus = '';
    this.fetchTimeout = 0;
    this.fetchInterval = 250;
    this.cache = new MemoryCache();
    this.missingPolicy = new SourceStringPolicy();
    this.errorPolicy = new SourceErrorPolicy();
    this.stringRenderer = new MessageFormatRenderer();
    this.currentLocale = '';
    this.locales = [];
    this.languages = [];
    this.childInstances = [];
  }

  /**
   * Initialize Native instance
   *
   * @param {Object} params
   * @param {String} params.cdsHost
   * @param {String} params.filterTags
   * @param {String} params.filterStatus
   * @param {String} params.token
   * @param {String} params.secret
   * @param {Number} params.fetchTimeout
   * @param {Number} params.fetchInterval
   * @param {Function} params.cache
   * @param {Function} params.missingPolicy
   * @param {Function} params.errorPolicy
   * @param {Function} params.stringRenderer
   */
  init(params) {
    const that = this;
    [
      'cdsHost',
      'token',
      'secret',
      'cache',
      'filterTags',
      'filterStatus',
      'fetchTimeout',
      'fetchInterval',
      'missingPolicy',
      'errorPolicy',
      'stringRenderer',
      'currentLocale',
    ].forEach((value) => {
      if (params[value] !== undefined) {
        that[value] = params[value];
      }
    });
    this.fetchedTags = {}; // {langCode: [tag1, tag2, ...], ...}
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
    return this.translateLocale(this.currentLocale, sourceString, params);
  }

  /**
   * Translate string to specific locale
   *
   * @param {String} locale
   * @param {String} sourceString
   * @param {Object} params - See {@link translate}
   * @returns {String}
   */
  translateLocale(locale, sourceString, params) {
    try {
      // get translation from source based key (2.x.x)
      let translation = this.cache.get(
        generateKey(sourceString, params),
        locale,
      );

      // fall back to hash based key (1.x.x)
      if (!translation) {
        translation = this.cache.get(
          generateHashedKey(sourceString, params),
          locale,
        );
      }

      if (translation
        && translation.startsWith('{???')
        && isPluralized(sourceString)
      ) {
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

      if (params && params._escapeVars) {
        const safeParams = {};
        Object.keys(params).forEach((property) => {
          const value = params[property];
          safeParams[property] = isString(value) ? escape(value) : value;
        });
        translation = this.stringRenderer.render(translation, locale, safeParams);
      } else {
        translation = this.stringRenderer.render(translation, locale, params);
      }

      if (isMissing && locale) {
        translation = this.missingPolicy.handle(translation, locale);
      }

      if (!isString(translation)) translation = `${translation}`;
      return translation;
    } catch (err) {
      return this.errorPolicy.handle(err,
        `${sourceString}`, locale, params);
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
    const filterTags = params.filterTags || this.filterTags;

    if (!params.refresh
      && !this.cache.isStale(localeCode)
      && (
        (!filterTags && this.cache.hasTranslations(localeCode))
        || (filterTags
          && (this.fetchedTags[localeCode] || []).indexOf(filterTags) !== -1)
      )) {
      return;
    }

    if (filterTags) {
      if (!(localeCode in this.fetchedTags)) {
        this.fetchedTags[localeCode] = [];
      }
      if (this.fetchedTags[localeCode].indexOf(filterTags) === -1) {
        this.fetchedTags[localeCode].push(filterTags);
      }
    }

    const handleError = (err) => {
      sendEvent(TRANSLATIONS_FETCH_FAILED, { localeCode, filterTags }, this);
      return err;
    };

    // contact CDS
    try {
      sendEvent(FETCHING_TRANSLATIONS, { localeCode, filterTags }, this);
      let response;
      let lastResponseStatus = 202;
      const tsNow = Date.now();
      while (lastResponseStatus === 202) {
        /* eslint-disable no-await-in-loop */
        let url = `${this.cdsHost}/content/${localeCode}`;
        const getOptions = [];
        if (filterTags) {
          getOptions.push(`filter[tags]=${filterTags}`);
        }
        if (this.filterStatus) {
          getOptions.push(`filter[status]=${this.filterStatus}`);
        }
        if (getOptions.length) {
          url = `${url}?${getOptions.join('&')}`;
        }
        response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Accept-version': 'v2',
            'X-NATIVE-SDK': `txjs/${__PLATFORM__}/${__VERSION__}`,
          },
        });
        lastResponseStatus = response.status;
        if (this.fetchTimeout > 0 && (Date.now() - tsNow) >= this.fetchTimeout) {
          throw handleError(new Error('Fetch translations timeout'));
        }
        if (lastResponseStatus === 202 && this.fetchInterval > 0) {
          await sleep(this.fetchInterval);
        }
        /* eslint-enable no-await-in-loop */
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
        sendEvent(TRANSLATIONS_FETCHED, { localeCode, filterTags }, this);
      } else {
        throw handleError(new Error('Could not fetch translations'));
      }
    } catch (err) {
      throw handleError(err);
    }
  }

  /**
   * Invalidate CDS cache
   *
   * @param {Object} params
   * @param {Boolean} params.purge
   * @returns {Object} Data
   * @returns {Number} Data.count
   * @returns {Number} Data.status
   * @returns {Number} Data.token
   */
  async invalidateCDS(params = {}) {
    if (!this.token) throw new Error('token is not defined');
    if (!this.secret) throw new Error('secret is not defined');

    const action = params.purge ? 'purge' : 'invalidate';
    const res = await axios.post(`${this.cdsHost}/${action}`, {
    }, {
      headers: {
        Authorization: `Bearer ${this.token}:${this.secret}`,
        'Accept-version': 'v2',
        'Content-Type': 'application/json;charset=utf-8',
        'X-NATIVE-SDK': `txjs/${__PLATFORM__}/${__VERSION__}`,
      },
    });
    return res.data;
  }

  /**
   * Push source content to CDS.
   *
   * Payload is in the following format:
   * {
   *   <key>: {
   *    string: <string>,
   *     meta: {
   *       context: <string>
   *       developer_comment: <string>,
   *       character_limit: <number>,
   *       tags: <array>,
   *       occurrences: <array>,
   *     }
   *   },
   *   <key>: { .. }
   * }
   *
   * @param {Object} payload
   * @param {Object} params
   * @param {Boolean} params.purge
   * @param {Boolean} params.overrideTags
   * @param {Boolean} params.overrideOccurrences
   * @param {Boolean} params.noWait - do not wait for upload results
   * @returns {Object} Data
   * @returns {String} Data.jobUrl
   * @returns {Number} Data.created
   * @returns {Number} Data.updated
   * @returns {Number} Data.skipped
   * @returns {Number} Data.deleted
   * @returns {Number} Data.failed
   * @returns {String[]} Data.errors
   * @returns {String} Data.status
   */
  async pushSource(payload, params = {}) {
    if (!this.token) throw new Error('token is not defined');
    if (!this.secret) throw new Error('secret is not defined');

    const headers = {
      Authorization: `Bearer ${this.token}:${this.secret}`,
      'Accept-version': 'v2',
      'Content-Type': 'application/json;charset=utf-8',
      'X-NATIVE-SDK': `txjs/${__PLATFORM__}/${__VERSION__}`,
    };

    const res = await axios.post(`${this.cdsHost}/content`, {
      data: payload,
      meta: {
        purge: !!params.purge,
        override_tags: !!params.overrideTags,
        override_occurrences: !!params.overrideOccurrences,
      },
    }, {
      headers,
    });

    const jobUrl = `${this.cdsHost}${res.data.data.links.job}`;

    if (params.noWait) {
      return {
        jobUrl,
      };
    }

    let pollStatus = {
      status: '',
    };

    do {
      // eslint-disable-next-line no-await-in-loop
      await sleep(1500);
      // eslint-disable-next-line no-await-in-loop
      const pollRes = await axios.get(jobUrl, {
        headers,
      });
      const { data } = pollRes.data;
      pollStatus = {
        ...(data.details || {}),
        errors: data.errors || [],
        status: data.status,
      };
    } while (pollStatus.status === 'pending' || pollStatus.status === 'processing');

    return {
      jobUrl,
      ...pollStatus,
    };
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

    const handleError = (err) => {
      sendEvent(LOCALES_FETCH_FAILED, null, this);
      return err;
    };

    // contact CDS
    try {
      sendEvent(FETCHING_LOCALES, null, this);
      let response;
      let lastResponseStatus = 202;
      const tsNow = Date.now();
      while (lastResponseStatus === 202) {
        /* eslint-disable no-await-in-loop */
        response = await axios.get(`${this.cdsHost}/languages`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Accept-version': 'v2',
            'X-NATIVE-SDK': `txjs/${__PLATFORM__}/${__VERSION__}`,
          },
        });
        lastResponseStatus = response.status;
        if (this.fetchTimeout > 0 && (Date.now() - tsNow) >= this.fetchTimeout) {
          throw handleError(new Error('Get locales timeout'));
        }
        if (lastResponseStatus === 202 && this.fetchInterval > 0) {
          await sleep(this.fetchInterval);
        }
        /* eslint-enable no-await-in-loop */
      }

      const { data } = response;
      if (data && data.data) {
        this.languages = data.data;
        this.locales = this.languages.map((entry) => entry.code);
        sendEvent(LOCALES_FETCHED, null, this);
      } else {
        throw handleError(new Error('Could not fetch languages'));
      }
    } catch (err) {
      throw handleError(err);
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
    if (this.isCurrent(localeCode)) {
      await this._syncInstances(this.childInstances);
      return;
    }

    if (!localeCode) {
      // update controller
      this.currentLocale = '';
      await this._syncInstances(this.childInstances);
      sendEvent(LOCALE_CHANGED, this.currentLocale, this);
      return;
    }

    // Fetch translations for controller instance
    await this.fetchTranslations(localeCode);
    this.currentLocale = localeCode;

    // Update children
    await this._syncInstances(this.childInstances);

    // Trigger controller change
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

  /**
   * Connect a child instance with this instance as controller.
   * When the language is changing on this instance, all child
   * instances will be updated as well.
   *
   * @param {*} instance
   * @returns {Promise}
   */
  async controllerOf(instance) {
    if (instance === this) {
      throw new Error('Cannot add self as instance');
    }
    if (instance.childInstances.indexOf(this) !== -1) {
      throw new Error('Cycle reference error, instance is controller of this');
    }

    this.childInstances.push(instance);
    await this._syncInstances([instance]);

    return instance;
  }

  /**
   * Private function to sync controller with
   * child instance.
   *
   * @param {Array} instances
   * @memberof TxNative
   */
  async _syncInstances(instances) {
    // update instance language
    const localeCode = this.getCurrentLocale();

    // update children instances
    if (localeCode) {
      for (let i = 0; i < instances.length; i++) {
        // do not fetch language if not needed
        if (instances[i].getCurrentLocale() !== localeCode) {
          // Fetch translations for additional instance without blocking
          // anything else in case of missing language
          try {
            // eslint-disable-next-line no-await-in-loop
            await instances[i].fetchTranslations(localeCode);
          } catch (e) {
            // no-op
          }
        }
      }
    }
    // Reloop through the instances to avoid content flash
    instances.forEach((instance) => {
      if (instance.getCurrentLocale() !== localeCode) {
        // eslint-disable-next-line no-param-reassign
        instance.currentLocale = localeCode;
        sendEvent(LOCALE_CHANGED, localeCode, instance);
      }
    });
  }
}
