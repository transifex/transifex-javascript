import { expect } from 'chai';
import {
  setTranslations,
  getTranslations,
  hasTranslations,
  getTranslation
} from '../src/storage';

describe('Storage functions', () => {
  it('work on empty storage', () => {
    expect(getTranslation('foo', 'bar')).to.equal('');
    expect(hasTranslations('foo')).to.equal(false);
    expect(getTranslations('foo')).to.deep.equal({});
  });

  it('work on valid storage', () => {
    setTranslations('fr', { 'key': 'value' })
    expect(getTranslation('fr', 'bar')).to.equal('');
    expect(getTranslation('fr', 'key')).to.equal('value');
    expect(hasTranslations('fr')).to.equal(true);
    expect(getTranslations('fr')).to.deep.equal({ 'key': 'value' });
  });
});
