import { expect } from 'chai';
import pseudo from '../src/pseudo';
import {
  setConfig,
  MISSING_POLICY_PSEUDO,
  MISSING_POLICY_SOURCE,
  MISSING_POLICY,
  t,
  setSelectedLanguage,
  getConfig,
  SOURCE_LANG_CODE
} from '../src';
import { setTranslations } from '../src/cache';

describe('Pseudo function', () => {
  it('works', () => {
    expect(pseudo('Hello')).to.equal('Ħḗḗŀŀǿǿ');
  });
});

describe('Pseudo localization', () => {
  it('works', async () => {
    setConfig(MISSING_POLICY, MISSING_POLICY_PSEUDO);

    setTranslations('pseudo', {});
    await setSelectedLanguage('pseudo');
    expect(t('Hello {user}', { user: 'Joe' })).to.equal('Ħḗḗŀŀǿǿ Ĵǿǿḗḗ');

    // revert
    setConfig(MISSING_POLICY, MISSING_POLICY_SOURCE);
    await setSelectedLanguage(getConfig(SOURCE_LANG_CODE));
  });
});