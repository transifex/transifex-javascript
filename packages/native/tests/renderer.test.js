/* globals describe, it */

import { expect } from 'chai';
import { tx, t } from '../src/index';

describe('String renderer', () => {
  it('renders with localized dates', async () => {
    const d = Date.parse('2020-02-01');

    // default locale
    expect(tx.stringRenderer.render('Date is {d, date, long}', '', { d }))
      .to.equal('Date is February 1, 2020');

    // French locale
    expect(tx.stringRenderer.render('Date is {d, date, long}', 'fr', { d }))
      .to.equal('Date is 1 février 2020');

    // German locale
    expect(tx.stringRenderer.render('Date is {d, date, long}', 'de_DE', { d }))
      .to.equal('Date is 1. Februar 2020');

    // invalid locale fallsback to english
    expect(tx.stringRenderer.render('Date is {d, date, long}', 'a', { d }))
      .to.equal('Date is February 1, 2020');
  });

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
