/* globals expect, test */

import React from 'react';

import {
  render, screen,
} from '@testing-library/react';

import { ws, createNativeInstance } from '@wordsmith/native';
import { useWS, WSProvider } from '../src';

test('uses default ws instance', async () => {
  function Display() {
    const inst = useWS();
    return (
      <>
        WS Instance is {inst.name}
      </>
    );
  }
  ws.name = 'foo';
  render(<Display />);
  expect(screen.queryByText('WS Instance is foo')).toBeTruthy();
  delete ws.name;
});

test('uses provider ws instance', async () => {
  function Display() {
    const inst = useWS();
    return (
      <>
        WS Instance is {inst.name}
      </>
    );
  }

  const instance = createNativeInstance();
  instance.name = 'foo';
  ws.name = 'bar';

  render(
    <WSProvider instance={instance}>
      <Display />
    </WSProvider>,
  );
  expect(screen.queryByText('WS Instance is foo')).toBeTruthy();
  delete ws.name;
});
