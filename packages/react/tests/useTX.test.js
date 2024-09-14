/* globals expect, test */

import React from 'react';

import {
  render, screen,
} from '@testing-library/react';

import { ws, createNativeInstance } from '@wordsmith/native';
import { useTX, TXProvider } from '../src';

test('uses default ws instance', async () => {
  function Display() {
    const inst = useTX();
    return (
      <>
        TX Instance is {inst.name}
      </>
    );
  }
  ws.name = 'foo';
  render(<Display />);
  expect(screen.queryByText('TX Instance is foo')).toBeTruthy();
  delete ws.name;
});

test('uses provider ws instance', async () => {
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
  ws.name = 'bar';

  render(
    <TXProvider instance={instance}>
      <Display />
    </TXProvider>,
  );
  expect(screen.queryByText('TX Instance is foo')).toBeTruthy();
  delete ws.name;
});
