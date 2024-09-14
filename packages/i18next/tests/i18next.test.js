/* globals describe, it */

import { expect } from 'chai';
import i18next from 'i18next';
import nock from 'nock';
import { WordsmithI18next } from '../src/index';

describe('WordsmithI18next', () => {
  it('works', async () => {
    const backend = new WordsmithI18next(null, {
      token: 'abcd',
    });

    nock(backend.ws.cdsHost)
      .get('/content/en')
      .reply(200, {
        data: {
          'key1.inner': {
            string: 'Hello world',
          },
          key2_wsplural: {
            string: '{count, plural, one {{{count}} apple} other {{{count}} apples}}',
          },
        },
      });

    const i18nextInst = i18next.createInstance();
    await i18nextInst.use(backend).init({
      lng: 'en',
    });

    expect(i18nextInst.t('key1.inner')).to.equal('Hello world');
    expect(i18nextInst.t('key2', { count: 1 })).to.equal('1 apple');
    expect(i18nextInst.t('key2', { count: 2 })).to.equal('2 apples');
  });
});
