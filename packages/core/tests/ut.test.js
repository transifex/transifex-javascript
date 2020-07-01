import { expect } from 'chai';
import {
  ut,
} from '../src/index';

describe('UT function', () => {
  it('translates', () => {
    expect(ut('Hello')).to.equal('Hello');
    expect(ut('Hello {username}', { username: 'Joe' })).
      to.equal('Hello Joe');
  });

  it('escapes variables', () => {
    expect(ut('Hello {username}', { username: '<b>Joe</b>' })).
      to.equal('Hello &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('does not escape source', () => {
    expect(ut('<b>Hello</b> {username}', { username: '<b>Joe</b>' })).
      to.equal('<b>Hello</b> &lt;b&gt;Joe&lt;/b&gt;');
  });

  it('with _safe works', () => {
    expect(ut('Hello {username}', { _safe: true, username: '<b>Joe</b>' })).
      to.equal('Hello <b>Joe</b>');
  });
});
