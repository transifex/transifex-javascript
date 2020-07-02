import { expect } from 'chai';
import pseudo from '../src/pseudo';
import {
  setConfig,
  MISSING_POLICY_PSEUDO,
  MISSING_POLICY_SOURCE,
  MISSING_POLICY,
  t,
  setLanguage,
  getConfig,
  SOURCE_LANG_CODE
} from '../src';
import { setTranslations } from '../src/storage';

describe('Pseudo function', () => {
  it('works', () => {
    expect(pseudo('Hello')).to.equal('Ħḗḗŀŀǿǿ');
  });
});

describe('Pseudo localization', () => {
  it('works', async () => {
    setConfig(MISSING_POLICY, MISSING_POLICY_PSEUDO);

    setTranslations('pseudo', {});
    await setLanguage('pseudo');
    expect(t('Hello {user}', { user: 'Joe' })).to.equal('Ħḗḗŀŀǿǿ Ĵǿǿḗḗ');

    // revert
    setConfig(MISSING_POLICY, MISSING_POLICY_SOURCE);
    await setLanguage(getConfig(SOURCE_LANG_CODE));
  });
});