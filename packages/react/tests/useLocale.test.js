/* globals expect, beforeEach, afterEach, test */

import React from 'react';

import {
  render, screen, cleanup,
} from '@testing-library/react';

import { ws } from '@wordsmith/native';
import { useLocale } from '../src';

let oldGetCurrentLocale;
beforeEach(() => {
  // Start mocking
  oldGetCurrentLocale = ws.getCurrentLocale;
  ws.getCurrentLocale = () => 'en';
});
afterEach(() => {
  // Reset mocking
  ws.getCurrentLocale = oldGetCurrentLocale;
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
