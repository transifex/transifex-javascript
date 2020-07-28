import MessageFormat from 'messageformat';
import MemoryCache from './cache/MemoryCache';
import { generateKey, isString, escape } from './utils';
import SourceStringPolicy from './policies/SourceStringPolicy';
import SourceErrorPolicy from './policies/SourceErrorPolicy';

const MF = new MessageFormat();

/**
 * Native core functionality
 *
 * @export
 * @class NativeCore
 */
export default class NativeCore {
  constructor() {
    this.cdsHost = 'https://cds.svc.transifex.net';
    this.token = '';
    this.secret = '';
    this.cache = new MemoryCache();
    this.missingPolicy = new SourceStringPolicy();
    this.errorPolicy = new SourceErrorPolicy();
  }

  /**
   * Initialize instance parameters
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
    ].forEach((value) => {
      if (params[value] !== undefined) {
        that[value] = params[value];
      }
    });
  }

  /**
   * Translate string to locale. All params are optional.
   *
   * @param {String} sourceString
   * @param {String} localeCode
   * @param {Object} params
   * @param {String} params._context - Source context, affects key generation
   * @param {String} params._comment - Developer comment
   * @param {Number} params._charlimit - Character limit
   * @param {String} params._tags - Comma separated list of tags
   * @param {String} params._key - Custom key
   * @param {Boolean} params._escapeVars - If true escape ICU variables
   * @returns {String}
   */
  translate(sourceString, localeCode, params) {
    try {
      const key = generateKey(sourceString, params);
      let translation = this.cache.get(key, localeCode);

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
        translation = this.missingPolicy.handle(translation, localeCode);
      }

      return translation;
    } catch (err) {
      return this.errorPolicy.handle(err, sourceString, localeCode, params);
    }
  }
}
