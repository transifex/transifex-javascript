/* globals describe, it, beforeEach, afterEach */

import { expect } from 'chai';
import nock from 'nock';
import { generateKey, createNativeInstance } from '../src/index';

describe('ws instance', () => {
  let t;
  let ws;

  beforeEach(() => {
    ws = createNativeInstance({
      fetchTimeout: 0,
      fetchInterval: 0,
    });
    t = ws.translate.bind(ws);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('getLocales fetches locales', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
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

    const locales = await ws.getLocales({ refresh: true });
    expect(locales).to.deep.equal(['el']);
  });

  it('getLanguages fetches languages', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
      .get('/languages')
      .reply(200, {
        data: [
          {
            name: 'German',
            code: 'de',
            localized_name: 'German',
            rtl: false,
          },
        ],
      });

    const langs = await ws.getLanguages({ refresh: true });
    expect(langs).to.deep.equal([{
      name: 'German',
      code: 'de',
      localized_name: 'German',
      rtl: false,
    }]);
  });

  it('setCurrentLocale translates strings', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
      .get('/content/el_GR')
      .reply(200, {
        data: {
          [generateKey('Hello')]: {
            string: 'Γειά',
          },
          [generateKey('World')]: {},
        },
      });

    await ws.setCurrentLocale('el_GR');
    expect(ws.getCurrentLocale()).to.equal('el_GR');
    expect(t('Hello')).to.deep.equal('Γειά');
    expect(t('World')).to.deep.equal('World');

    // restore to source
    await ws.setCurrentLocale('');
    expect(t('Hello')).to.deep.equal('Hello');
  });

  it('setCurrentLocale throws when remote translations are unavailable', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
      .get('/content/el_GR2')
      .reply(500);

    let threw = false;
    try {
      await ws.setCurrentLocale('el_GR2');
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
    expect(ws.getCurrentLocale()).to.equal('');
  });

  it('setCurrentLocale throws when remote translations are invalid', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
      .get('/content/el_GR2')
      .reply(200, {});

    let threw = false;
    try {
      await ws.setCurrentLocale('el_GR2');
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
    expect(ws.getCurrentLocale()).to.equal('');
  });

  it('setCurrentLocale skips when locale is already set', async () => {
    const current = ws.getCurrentLocale();
    await ws.setCurrentLocale(current);
    expect(ws.getCurrentLocale()).to.equal(current);
  });

  it('getLocales throws when remote does not respond', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
      .get('/languages')
      .reply(500);

    let threw = false;
    try {
      await ws.getLocales({ refresh: true });
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
  });

  it('getLocales throws when remote response is wrong', async () => {
    ws.init({
      token: 'abcd',
    });

    nock(ws.cdsHost)
      .get('/languages')
      .reply(200, {});

    let threw = false;
    try {
      await ws.getLocales({ refresh: true });
    } catch (err) {
      threw = true;
    }
    expect(threw).to.equal(true);
  });

  it('getLocales returns empty array when token is not set', async () => {
    ws.init({
      token: '',
    });
    const locales = await ws.getLocales({ refresh: true });
    expect(locales).to.deep.equal([]);
  });

  it('fetchTranslations does not refresh when cache has content', async () => {
    ws.cache.update('el_CACHED', { foo: 'bar' });
    await ws.fetchTranslations('el_CACHED');
    expect(ws.cache.getTranslations('el_CACHED')).to.deep.equal({
      foo: 'bar',
    });
  });

  it('fetchTranslations respects filterTags', async () => {
    const scope = nock(ws.cdsHost)
      .get('/content/lang?filter[tags]=tag1,tag2')
      .reply(200, {
        data: {},
      });

    ws.init({
      token: '',
      filterTags: 'tag1,tag2',
    });
    await ws.fetchTranslations('lang');
    expect(scope.isDone()).to.equal(true);
  });

  it('fetchTranslations respects filterStatus', async () => {
    const scope = nock(ws.cdsHost)
      .get('/content/lang?filter[status]=reviewed')
      .reply(200, {
        data: {},
      });

    ws.init({
      token: '',
      filterStatus: 'reviewed',
    });
    await ws.fetchTranslations('lang');
    expect(scope.isDone()).to.equal(true);
  });

  it('fetchTranslations respects both filterTags & filterStatus', async () => {
    const scope = nock(ws.cdsHost)
      .get('/content/lang?filter[tags]=tag1,tag2&filter[status]=reviewed')
      .reply(200, {
        data: {},
      });

    ws.init({
      token: '',
      filterTags: 'tag1,tag2',
      filterStatus: 'reviewed',
    });
    await ws.fetchTranslations('lang');
    expect(scope.isDone()).to.equal(true);
  });

  it('retries fetching languages', async () => {
    ws.init({ token: 'abcd' });
    nock(ws.cdsHost)
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
    const locales = await ws.getLocales({ refresh: true });
    expect(locales).to.deep.equal(['el']);
  });

  it('retries fetching languages with timeout', async () => {
    ws.init({ token: 'abcd', fetchTimeout: 50 });
    nock(ws.cdsHost)
      .get('/languages')
      .delayConnection(60)
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

    let hasError = false;
    try {
      await ws.getLocales({ refresh: true });
    } catch (err) {
      hasError = true;
    }
    expect(hasError).to.equal(true);
  });

  it('retries fetching languages with interval', async () => {
    ws.init({ token: 'abcd', fetchInterval: 50 });
    nock(ws.cdsHost)
      .get('/languages')
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

    const ts = Date.now();
    await ws.getLocales({ refresh: true });
    expect(Date.now() - ts).to.be.greaterThan(50);
  });

  it('retries fetching translations', async () => {
    ws.init({ token: 'abcd' });
    nock(ws.cdsHost)
      .get('/content/el')
      .twice()
      .reply(202)
      .get('/content/el')
      .reply(200, { data: { source: { string: 'translation' } } });
    await ws.fetchTranslations('el');
    expect(ws.cache.get('source', 'el')).to.equal('translation');
  });

  it('retries fetching translations with timeout', async () => {
    ws.init({ token: 'abcd', fetchTimeout: 50 });
    nock(ws.cdsHost)
      .get('/content/el_timeout')
      .delayConnection(60)
      .reply(202)
      .get('/content/el_timeout')
      .reply(200, { data: { source: { string: 'translation' } } });

    let hasError = false;
    try {
      await ws.fetchTranslations('el_timeout');
    } catch (err) {
      hasError = true;
    }
    expect(hasError).to.equal(true);
  });

  it('retries fetching translations with interval delays', async () => {
    ws.init({ token: 'abcd', fetchInterval: 50 });
    nock(ws.cdsHost)
      .get('/content/el_interval')
      .reply(202)
      .get('/content/el_interval')
      .reply(200, { data: { source: { string: 'translation' } } });

    const ts = Date.now();
    await ws.fetchTranslations('el_interval');
    expect(Date.now() - ts).to.be.greaterThan(50);
  });
});
