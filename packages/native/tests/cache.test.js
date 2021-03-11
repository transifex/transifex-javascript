/* globals describe, it */

import { expect } from 'chai';
import MemoryCache from '../src/cache/MemoryCache';

describe('MemoryCache', () => {
  it('works on empty cache', () => {
    const cache = new MemoryCache();
    expect(cache.get('foo', 'bar')).to.equal('');
    expect(cache.hasTranslations('foo')).to.equal(false);
    expect(cache.isStale('foo')).to.equal(true);
    expect(cache.getTranslations('foo')).to.deep.equal({});
  });

  it('works on valid cache', () => {
    const cache = new MemoryCache();
    cache.update('fr', { key: 'value' });
    expect(cache.get('bar', 'fr')).to.equal('');
    expect(cache.get('key', 'fr')).to.equal('value');
    expect(cache.hasTranslations('fr')).to.equal(true);
    expect(cache.isStale('fr')).to.equal(false);
    expect(cache.getTranslations('fr')).to.deep.equal({ key: 'value' });
  });
});
