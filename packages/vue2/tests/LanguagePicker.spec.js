/**
 * @jest-environment jsdom
 */

/* globals test, beforeEach, afterEach, expect */
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/vue';

import { ws } from '@wordsmith/native';
import { LanguagePicker } from '../src/index';

let oldGetLanguages;
beforeEach(() => {
  // Start mocking
  oldGetLanguages = ws.getLanguages;
  ws.getLanguages = async () => [
    { code: 'el', name: 'Greek' },
    { code: 'fr', name: 'French' },
  ];
});
afterEach(() => {
  // Reset mocking
  ws.getLanguages = oldGetLanguages;
  cleanup();
});

test('display language picker', async () => {
  render(LanguagePicker);
  await waitFor(() => screen.getByText('Greek'));
  expect(screen.queryByText('Greek')).toBeTruthy();
  expect(screen.queryByText('French')).toBeTruthy();
});

test('change language', async () => {
  // Start mocking
  const args = [];
  const oldSetCurrentLocale = ws.setCurrentLocale;
  ws.setCurrentLocale = function setCurrentLocaleMock(code) {
    args.push(code);
  };

  render(LanguagePicker);
  await waitFor(() => screen.getByText('Greek'));
  const combobox = screen.getByRole('combobox');
  await fireEvent.update(combobox, 'el');
  expect(args).toEqual(['el']);

  // Reset mocking
  ws.setCurrentLocale = oldSetCurrentLocale;
});
