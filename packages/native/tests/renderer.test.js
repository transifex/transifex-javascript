/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { createNativeInstance } from '../src/index';

const NODE_VER = parseInt((process.version.split('.')[0]).replace('v', ''), 10);

describe('String renderer', () => {
  let t;
  let tx;

  beforeEach(() => {
    tx = createNativeInstance();
    t = tx.translate.bind(tx);
  });

  it('renders plurals', () => {
    expect(tx.stringRenderer.render('{cnt, plural, one {# hello} other {# hellos}}', '', { cnt: 1 }))
      .to.equal('1 hello');
    expect(tx.stringRenderer.render('{cnt, plural, one {# hello} other {# hellos}}', '', { cnt: 0 }))
      .to.equal('0 hellos');
    expect(tx.stringRenderer.render('{cnt, plural, one {# one hello} two {# two hellos} many {# many hellos} other {# other hellos}}', '', { cnt: 2 }))
      .to.equal('2 other hellos');
    expect(tx.stringRenderer.render('{cnt, plural, one {# one hello} two {# two hellos} many {# many hellos} other {# other hellos}}', 'he', { cnt: 2 }))
      .to.equal('2 two hellos');
    expect(tx.stringRenderer.render('{cnt, plural, one {תחנה אחת} two {# תחנות} many {# תחנות} other {# תחנות}}', 'he', { cnt: 0 }))
      .to.equal('0 תחנות');
    expect(tx.stringRenderer.render('{cnt, plural, one {תחנה אחת} two {# תחנות} many {# תחנות} other {# תחנות}}', 'he', { cnt: 1 }))
      .to.equal('תחנה אחת');
    expect(tx.stringRenderer.render('{cnt, plural, one {תחנה אחת} two {# תחנות} many {# תחנות} other {# תחנות}}', 'he', { cnt: 2 }))
      .to.equal('2 תחנות');
  });

  it('renders with localized dates', async () => {
    const d = Date.parse('2020-02-01');

    // default locale
    expect(tx.stringRenderer.render('Date is {d, date, long}', '', { d }))
      .to.equal('Date is February 1, 2020');

    // Node prior to 13 is build with small-icu support and date localization
    // will not work. So enable this test only on latest versions
    expect(NODE_VER).to.be.greaterThanOrEqual(10);
    if (NODE_VER >= 13) {
      // French locale
      expect(tx.stringRenderer.render('Date is {d, date, long}', 'fr', { d }))
        .to.equal('Date is 1 février 2020');

      // German locale
      expect(tx.stringRenderer.render('Date is {d, date, long}', 'de_DE', { d }))
        .to.equal('Date is 1. Februar 2020');
    }

    // invalid locale fallsback to english
    expect(tx.stringRenderer.render('Date is {d, date, long}', 'a', { d }))
      .to.equal('Date is February 1, 2020');
  });

  it('renders with custom renderer', async () => {
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
  });
});
