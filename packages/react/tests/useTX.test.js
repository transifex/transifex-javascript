/* globals expect, test */

import React from 'react';

import {
  render, screen,
} from '@testing-library/react';

import { tx, createNativeInstance } from '@transifex/native';
import { useTX, TXProvider } from '../src';

test('uses default tx instance', async () => {
  function Display() {
    const inst = useTX();
    return (
      <>
        TX Instance is {inst.name}
      </>
    );
  }
  tx.name = 'foo';
  render(<Display />);
  expect(screen.queryByText('TX Instance is foo')).toBeTruthy();
  delete tx.name;
});

test('uses provider tx instance', async () => {
  function Display() {
    const inst = useTX();
    return (
      <>
        TX Instance is {inst.name}
      </>
    );
  }

  const instance = createNativeInstance();
  instance.name = 'foo';
  tx.name = 'bar';

  render(
    <TXProvider instance={instance}>
      <Display />
    </TXProvider>,
  );
  expect(screen.queryByText('TX Instance is foo')).toBeTruthy();
  delete tx.name;
});
