/* eslint class-methods-use-this: 0, no-unused-vars: 0 */

/**
 * Error policy that throws the initial error
 *
 * @export
 * @class ThrowErrorPolicy
 */
export default class ThrowErrorPolicy {
  handle(error, sourceString, localeCode, params) {
    throw error || new Error(`Error translating "${sourceString}"`);
  }
}
