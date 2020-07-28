/* eslint class-methods-use-this: 0, no-unused-vars: 0 */

/**
 * Error policy that suppresses error and returns source string
 *
 * @export
 * @class SourceErrorPolicy
 */
export default class SourceErrorPolicy {
  handle(error, sourceString, localeCode, params) {
    return sourceString;
  }
}
