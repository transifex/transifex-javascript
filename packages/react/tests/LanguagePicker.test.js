/* globals test, beforeEach, afterEach, expect */

import React from 'react';

import {
  cleanup, render, screen, waitFor, fireEvent,
} from '@testing-library/react';

import { tx } from '@transifex/native';
import { LanguagePicker } from '../src';

let oldGetLanguages;
beforeEach(() => {
  // Start mocking
  oldGetLanguages = tx.getLanguages;
  tx.getLanguages = async () => [
    { code: 'el', name: 'Greek' }, { code: 'fr', name: 'French' },
  ];
});
afterEach(() => {
  // Reset mocking
  tx.getLanguages = oldGetLanguages;
  cleanup();
});

test('display language picker', async () => {
  render(<LanguagePicker />);
  await waitFor(() => screen.getByText('Greek'));
  expect(screen.queryByText('Greek')).toBeTruthy();
  expect(screen.queryByText('French')).toBeTruthy();
});

test('change language', async () => {
  // Start mocking
  const args = [];
  const oldSetCurrentLocale = tx.setCurrentLocale;
  tx.setCurrentLocale = function setCurrentLocaleMock(code) {
    args.push(code);
  };

  render(<LanguagePicker />);
  await waitFor(() => screen.getByText('Greek'));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'el' } });
  expect(args).toEqual(['el']);

  // Reset mocking
  tx.setCurrentLocale = oldSetCurrentLocale;
});
