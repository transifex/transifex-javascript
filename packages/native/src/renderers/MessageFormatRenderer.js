/* eslint-disable class-methods-use-this */
import MessageFormat from '@messageformat/core';

const MF = new MessageFormat();

/**
 * MessageFormat renderer
 *
 * @export
 * @class MessageFormatRenderer
 */
export default class MessageFormatRenderer {
  render(sourceString, localeCode, params) {
    const msg = MF.compile(sourceString);
    return msg(params);
  }
}
