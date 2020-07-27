/**
 * Store the current language state of the App
 *
 * @export
 * @class LangState
 */
export default class LangState {
  constructor() {
    this.sourceLocale = '';
    this.currentLocale = '';
    this.appLocales = [];
    this.remoteLocales = [];
    this.remoteLanguages = [];
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
}
