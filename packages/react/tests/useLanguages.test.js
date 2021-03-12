/* globals expect, beforeEach, afterEach, test */

import React from 'react';

import {
  render, screen, cleanup, waitFor,
} from '@testing-library/react';

import { tx } from '@transifex/native';
import { useLanguages } from '../src';

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
