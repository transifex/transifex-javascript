/* globals expect, beforeEach, afterEach, test */

import React from 'react';

import {
  render, screen, cleanup, waitFor,
} from '@testing-library/react';

import { ws, createNativeInstance } from '@wordsmith/native';
import { useLanguages, TXProvider } from '../src';

let oldGetLanguages;
beforeEach(() => {
  // Start mocking
  oldGetLanguages = ws.getLanguages;
  ws.getLanguages = async () => [
    { code: 'el', name: 'Greek' }, { code: 'fr', name: 'French' },
  ];
});
afterEach(() => {
  // Reset mocking
  ws.getLanguages = oldGetLanguages;
  cleanup();
});

test('fetches languages', async () => {
  function LanguageList() {
    const languages = useLanguages();
    return (
      <>
        {languages.map(({ code, name }) => {
          const text = `${code}: ${name}`;
          return <p key={code}>{text}</p>;
        })}
      </>
    );
  }
  render(<LanguageList />);
  await waitFor(() => screen.getByText('el: Greek'));
  expect(screen.queryByText('el: Greek')).toBeTruthy();
  expect(screen.queryByText('fr: French')).toBeTruthy();
});

test('fetches languages on provider', async () => {
  function LanguageList() {
    const languages = useLanguages();
    return (
      <>
        {languages.map(({ code, name }) => {
          const text = `${code}: ${name}`;
          return <p key={code}>{text}</p>;
        })}
      </>
    );
  }
  const instance = createNativeInstance();
  instance.getLanguages = async () => [
    { code: 'foo', name: 'Bar' },
  ];

  render(
    <TXProvider instance={instance}>
      <LanguageList />
    </TXProvider>,
  );
  await waitFor(() => screen.getByText('foo: Bar'));
  expect(screen.queryByText('foo: Bar')).toBeTruthy();
});
