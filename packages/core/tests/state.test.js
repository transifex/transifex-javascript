import { expect } from 'chai';
import nock from 'nock';
import {
  CDS_URL,
  setConfig,
  getConfig,
  getAvailableLanguages,
  generateKey,
  setSelectedLanguage,
  getSelectedLanguage,
  t,
  SOURCE_LANG_CODE,
} from '../src/index';

describe('State functions', () => {
  it('getAvailableLanguages', async () => {
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
    const languages = await getAvailableLanguages();
    expect(languages).to.deep.equal([
      { name: 'Greek', code: 'el', localized_name: 'Ελληνικά', rtl: false }
    ]);
  });

  it('setSelectedLanguage', async () => {
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

    await setSelectedLanguage('el');
    expect(getSelectedLanguage()).to.equal('el');
    expect(t('Hello')).to.deep.equal('Γειά');

    // restore to source
    await setSelectedLanguage(getConfig(SOURCE_LANG_CODE));
    expect(t('Hello')).to.deep.equal('Hello');
  });
});
