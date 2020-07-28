/* globals describe, it */

import { expect } from 'chai';
import { onEvent, offEvent, sendEvent } from '../src/index';

describe('Event api', () => {
  it('sends and listens to events', () => {
    let called = 0;

    function callback(payload) {
      expect(payload).to.equal('foo');
      called++;
    }

    onEvent('translate', callback);
    sendEvent('translate', 'foo');

    offEvent('translate', callback);
    offEvent('fetch', callback);
    sendEvent('translate', 'foo');

    expect(called).to.equal(1);
  });
});
