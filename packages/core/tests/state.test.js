import { expect } from 'chai';
import nock from 'nock';
import {
  CDS_URL,
  setConfig,
  getConfig,
  getAllLanguages,
  generateKey,
  setLanguage,
  getLanguage,
  t,
  SOURCE_LANG_CODE,
} from '../src/index';

describe('State functions', () => {
  it('getAllLanguages', async () => {
    setConfig(CDS_URL, 'http://cds');
    nock(getConfig(CDS_URL)).
      get('/languages').
      reply(200, {
        data: [
          {
            name: 'Greek',
            code: 'el',
            localized_name: 'Ελληνικά',
            rtl: false,
          }
        ],
      });
    const languages = await getAllLanguages();
    expect(languages).to.deep.equal([
      { name: 'Greek', code: 'el', localized_name: 'Ελληνικά', rtl: false }
    ]);
  });

  it('setLanguage', async () => {
    setConfig(CDS_URL, 'http://cds');
    nock(getConfig(CDS_URL)).
      get('/content/el').
      reply(200, {
        data: {
          [generateKey('Hello')]: {
            string: 'Γειά',
          },
        },
      });

    await setLanguage('el');
    expect(getLanguage()).to.equal('el');
    expect(t('Hello')).to.deep.equal('Γειά');

    // restore to source
    await setLanguage(getConfig(SOURCE_LANG_CODE));
    expect(t('Hello')).to.deep.equal('Hello');
  });
});
