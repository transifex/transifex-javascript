/* globals describe, it */

import { expect } from 'chai';
import { tx, t } from '../src/index';

describe('String renderer', () => {
  it('renders with custom renderer', async () => {
    const oldRenderer = tx.stringRenderer;

    class CustomRenderer {
      // eslint-disable-next-line class-methods-use-this
      render() {
        return 'foo';
      }
    }

    tx.init({
      stringRenderer: new CustomRenderer(),
    });

    expect(t('Hello')).to.deep.equal('foo');

    // revert
    tx.init({
      stringRenderer: oldRenderer,
    });
  });
});
