/* eslint-disable class-methods-use-this */
import IntlMessageFormat from 'intl-messageformat';

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
    let msg;
    try {
      msg = new IntlMessageFormat(sourceString, locale, undefined, { ignoreTag: true });
    } catch (err) {
      msg = new IntlMessageFormat(sourceString, undefined, undefined, { ignoreTag: true });
    }
    return msg.format(params);
  }
}
