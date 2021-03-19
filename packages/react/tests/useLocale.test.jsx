/* globals expect, beforeEach, afterEach, test */

import React from 'react';

import {
  render, screen, cleanup, waitFor,
} from '@testing-library/react';

import { tx } from '@transifex/native';
import { useLocale } from '../src';

let oldGetCurrentLocale;
beforeEach(() => {
  // Start mocking
  oldGetCurrentLocale = tx.getCurrentLocale;
  tx.getCurrentLocale = () => { return 'en' };
});
afterEach(() => {
  // Reset mocking
  tx.getCurrentLocale = oldGetCurrentLocale;
  cleanup();
});

test('displays current locale', async () => {
  function LocaleDisplay() {
    const locale = useLocale();
    return (
      <>
        Current locale is {locale}
      </>
    );
  }
  render(<LocaleDisplay />);
  expect(screen.queryByText('Current locale is en')).toBeTruthy();
});
