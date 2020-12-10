/* globals describe, it */

import { expect } from 'chai';
import {
  PseudoTranslationPolicy,
  SourceStringPolicy,
  SourceErrorPolicy,
  ThrowErrorPolicy,
} from '../src/index';

describe('Missing policy', () => {
  it('SourceStringPolicy works', () => {
    const policy = new SourceStringPolicy();
    expect(policy.handle('Hello {}')).to.equal('Hello {}');
  });

  describe('PseudoTranslationPolicy', () => {
    it('works', () => {
      const policy = new PseudoTranslationPolicy();
      expect(policy.handle('Hello {}')).to.equal('Ħḗḗŀŀǿǿ {}');
    });

    it('ignores react interpolation properties', () => {
      const policy = new PseudoTranslationPolicy();
      expect(policy.handle('Hello __txnative__50__txnative__ world')).to.equal('Ħḗḗŀŀǿǿ __txnative__50__txnative__ ẇǿǿřŀḓ');
    });
  });
});

describe('Error policy', () => {
  it('SourceErrorPolicy works', () => {
    const policy = new SourceErrorPolicy();
    expect(policy.handle(new Error(), 'Hello')).to.equal('Hello');
  });

  it('ThrowErrorPolicy works', () => {
    const policy = new ThrowErrorPolicy();
    expect(() => policy.handle(new Error(), 'Hello'))
      .to.throw();
    expect(() => policy.handle(undefined, 'Hello'))
      .to.throw();
  });
});
