import {expect} from 'chai';
import Transifex from '../src/index';

const { onEvent, offEvent, sendEvent } = Transifex;

describe('Event functions', () => {
  it('works', () => {
    let called = 0;

    function callback(payload) {
      expect(payload).to.equal('foo');
      called++;
    }

    onEvent('translate', callback);
    sendEvent('translate', 'foo');

    offEvent('translate', callback);
    sendEvent('translate', 'foo');

    expect(called).to.equal(1);
  });
});
