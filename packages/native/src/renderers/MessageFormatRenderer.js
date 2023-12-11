/* eslint-disable class-methods-use-this */
import MessageFormat from '@messageformat/core';

// object to cache MessageFormat classes related to
// specific locales
const MF = {};

/**
 * MessageFormat renderer
 *
 * @export
 * @class MessageFormatRenderer
 */
export default class MessageFormatRenderer {
  render(sourceString, localeCode, params) {
    // construct a MessageFormat class based on locale
    // to make dates and other content localizable
    const locale = ((localeCode || '').split('_'))[0];
    if (!MF[locale]) {
      try {
        MF[locale] = new MessageFormat(locale, {
          strictPluralKeys: false,
        });
      } catch (err) {
        MF[locale] = new MessageFormat('*', {
          strictPluralKeys: false,
        });
      }
    }
    const msg = MF[locale].compile(sourceString);
    return msg(params);
  }
}
