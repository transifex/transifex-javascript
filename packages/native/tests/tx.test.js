/* globals describe, it */

import { expect } from 'chai';
import nock from 'nock';
import {
  tx,
  t,
  generateKey,
  saveToSessionStorage,
} from '../src/index';

describe('tx instance', () => {
  it('sets current locale to source locale on init', () => {
    const prev = tx.sourceLocale;

    tx.currentLocale = '';
    tx.init({
      sourceLocale: 'en',
    });

    expect(tx.getCurrentLocale()).to.equal('en');

    tx.init({
      sourceLocale: prev,
    });
  });

  it('getRemoteLocales fetches locales', async () => {
    tx.init({
      token: 'abcd',
    });

    nock(tx.cdsHost)
      .get('/languages')
      .reply(200, {
        data: [
          {
            name: 'Greek',
            code: 'el',
            localized_name: 'Ελληνικά',
            rtl: false,
          },
        ],
      });

    const locales = await tx.getRemoteLocales({ refresh: true });
    expect(locales).to.deep.equal(['el']);
  });

  it('getAppLocales returns app locales', async () => {
    tx.init({
      appLocales: ['de', 'fr'],
    });

    const locales = tx.getAppLocales();
    expect(locales).to.deep.equal(['de', 'fr']);
  });

  it('getSupportedLocales returns locales', async () => {
    tx.init({
      token: 'abcd',
      appLocales: ['de', 'fr'],
    });

    nock(tx.cdsHost)
      .get('/languages')
      .reply(200, {
        data: [
          {
            name: 'French',
            code: 'fr',
            localized_name: 'French',
            rtl: false,
          },
          {
            name: 'Greek',
            code: 'el',
            localized_name: 'Ελληνικά',
            rtl: false,
          },
        ],
      });

    await tx.getRemoteLocales({ refresh: true });
    const locales = await tx.getSupportedLocales();
    expect(locales).to.deep.equal(['fr']);

    const languages = await tx.getLanguages();
    expect(languages).to.deep.equal([
      {
        name: 'French',
        code: 'fr',
        localized_name: 'French',
        rtl: false,
      },
    ]);
  });

  it('getSupportedLocales returns remote when app locales are missing', async () => {
    tx.init({
      token: 'abcd',
      appLocales: [],
    });

    nock(tx.cdsHost)
      .get('/languages')
      .reply(200, {
        data: [
          {
            name: 'French',
            code: 'fr',
            localized_name: 'French',
            rtl: false,
          },
          {
            name: 'Greek',
            code: 'el',
            localized_name: 'Ελληνικά',
            rtl: false,
          },
        ],
      });

    await tx.getRemoteLocales({ refresh: true });
    const locales = await tx.getSupportedLocales();
    expect(locales).to.deep.equal(['fr', 'el']);

    const languages = await tx.getLanguages();
    expect(languages).to.deep.equal([
      {
        name: 'French',
        code: 'fr',
        localized_name: 'French',
        rtl: false,
      },
      {
        name: 'Greek',
        code: 'el',
        localized_name: 'Ελληνικά',
        rtl: false,
      },
    ]);
  });

  it('setCurrentLocale translates strings', async () => {
    tx.init({
      token: 'abcd',
    });

    nock(tx.cdsHost)
      .get('/content/el_GR')
      .reply(200, {
        data: {
          [generateKey('Hello')]: {
            string: 'Γειά',
          },
          [generateKey('World')]: {},
        },
      });

    await tx.setCurrentLocale('el_GR');
    expect(tx.getCurrentLocale()).to.equal('el_GR');
    expect(t('Hello')).to.deep.equal('Γειά');
    expect(t('World')).to.deep.equal('World');

    // restore to source
    await tx.setCurrentLocale(tx.sourceLocale);
    expect(t('Hello')).to.deep.equal('Hello');
  });

  it('setCurrentLocale throws when remote translations are unavailable', async () => {
    tx.init({
      token: 'abcd',
    });

    nock(tx.cdsHost)
      .get('/content/el_GR2')
      .reply(500);

    let threw = false;
    try {
      await tx.setCurrentLocale('el_GR2');
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
    expect(tx.getCurrentLocale()).to.equal(tx.sourceLocale);
  });

  it('setCurrentLocale throws when remote translations are invalid', async () => {
    tx.init({
      token: 'abcd',
    });

    nock(tx.cdsHost)
      .get('/content/el_GR2')
      .reply(200, {});

    let threw = false;
    try {
      await tx.setCurrentLocale('el_GR2');
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
    expect(tx.getCurrentLocale()).to.equal(tx.sourceLocale);
  });

  it('setCurrentLocale skips when locale is already set', async () => {
    const current = tx.getCurrentLocale();
    await tx.setCurrentLocale(current);
    expect(tx.getCurrentLocale()).to.equal(current);
  });

  it('getRemoteLocales throws when remote does not respond', async () => {
    tx.init({
      token: 'abcd',
    });

    nock(tx.cdsHost)
      .get('/languages')
      .reply(500);

    let threw = false;
    try {
      await tx.getRemoteLocales({ refresh: true });
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
  });

  it('getRemoteLocales throws when remote response is wrong', async () => {
    tx.init({
      token: 'abcd',
    });

    nock(tx.cdsHost)
      .get('/languages')
      .reply(200, {});

    let threw = false;
    try {
      await tx.getRemoteLocales({ refresh: true });
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
  });

  it('getRemoteLocales returns empty array when token is not set', async () => {
    tx.init({
      token: '',
    });
    const locales = await tx.getRemoteLocales({ refresh: true });
    expect(locales).to.deep.equal([]);
  });

  it('fetchTranslations does not refresh when cache has content', async () => {
    tx.cache.update('el_CACHED', { foo: 'bar' });
    await tx.fetchTranslations('el_CACHED');
    expect(tx.cache.getTranslations('el_CACHED')).to.deep.equal({
      foo: 'bar',
    });
  });

  it('retries fetching languages', async () => {
    tx.init({ token: 'abcd' });
    nock(tx.cdsHost)
      .get('/languages')
      .twice()
      .reply(202)
      .get('/languages')
      .reply(200, {
        data: [{
          name: 'Greek',
          code: 'el',
          localized_name: 'Ελληνικά',
          rtl: false,
        }],
      });
    const locales = await tx.getRemoteLocales({ refresh: true });
    expect(locales).to.deep.equal(['el']);
  });

  it('retries fetching translations', async () => {
    tx.init({ token: 'abcd' });
    nock(tx.cdsHost)
      .get('/content/el')
      .twice()
      .reply(202)
      .get('/content/el')
      .reply(200, { data: { source: { string: 'translation' } } });
    await tx.fetchTranslations('el', { refresh: true });
    expect(tx.cache.get('source', 'el')).to.equal('translation');
  });

  it('uses etag when fetching languages', async () => {
    tx.init({ token: 'abcdef' });

    saveToSessionStorage('tx:languages:abcdef', {
      etag: 'etag',
      data: [{
        name: 'German',
        code: 'de',
        localized_name: 'German',
        rtl: false,
      }],
    });

    nock(tx.cdsHost)
      .get('/languages')
      .reply(304);

    const locales = await tx.getRemoteLocales({ refresh: true });
    expect(locales).to.deep.equal(['de']);
  });

  it('uses etag when fetching translations', async () => {
    tx.init({ token: 'abcdef' });

    saveToSessionStorage('tx:content:abcdef:de', {
      etag: 'etag',
      data: {
        source: 'translation',
      },
    });

    nock(tx.cdsHost)
      .get('/content/de')
      .reply(304);

    await tx.fetchTranslations('de', { refresh: true });
    expect(tx.cache.get('source', 'de')).to.equal('translation');
  });
});
