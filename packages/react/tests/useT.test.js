/* globals describe, it, expect, afterEach */

import React, { useState } from 'react';

import {
  render, screen, cleanup, fireEvent, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { sendEvent, LOCALE_CHANGED, createNativeInstance } from '@wordsmith/native';
import { TXProvider, useT } from '../src';

describe('useT', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders text', () => {
    function MyComp() {
      const t = useT();
      const message = t('Hello <b>safe text</b>');
      return (message);
    }

    render(<MyComp />);
    expect(screen.queryByText('Hello <b>safe text</b>')).toBeInTheDocument();
  });

  it('renders text with param', () => {
    function MyComp() {
      const t = useT();
      const message = t('Hello <b>{username}</b>', {
        username: 'JohnDoe',
      });
      return (message);
    }

    render(<MyComp />);
    expect(screen.queryByText('Hello <b>JohnDoe</b>')).toBeInTheDocument();
  });

  it('rerenders on prop change', () => {
    function MyComp() {
      const [word, setWord] = useState('');
      const t = useT();
      const message = t('hello {word}', { word });
      return (
        <>
          <input value={word} onChange={(e) => setWord(e.target.value)} />
          <p>{message}</p>
        </>
      );
    }
    render(<MyComp />);
    fireEvent.change(
      screen.getByRole('textbox'),
      { target: { value: 'world' } },
    );
    expect(screen.getByText('hello world')).toBeTruthy();
  });

  it('renders react elements', () => {
    function MyComp() {
      const [word, setWord] = useState('');
      const t = useT();
      const message = t('hello {w}', { w: <b>world</b> });
      return (
        <>
          <input value={word} onChange={(e) => setWord(e.target.value)} />
          <p>{message}</p>
        </>
      );
    }
    render(<MyComp />);
    expect(screen.getByText('world')).toBeTruthy();
    act(() => {
      sendEvent(LOCALE_CHANGED);
    });
  });

  it('renders with custom instance', () => {
    const instance = createNativeInstance();
    instance.translateLocale = () => 'hello from custom instance';

    function MyComp() {
      const t = useT(instance);
      const message = t('hello');
      return (
        <p>{message}</p>
      );
    }
    render(<MyComp />);
    expect(screen.getByText('hello from custom instance')).toBeTruthy();
  });

  it('renders with provider', () => {
    const instance = createNativeInstance();
    instance.translateLocale = () => 'hello from provider';

    function MyComp() {
      const t = useT();
      const message = t('hello');
      return (
        <p>{message}</p>
      );
    }
    render(
      <TXProvider instance={instance}>
        <MyComp />
      </TXProvider>,
    );
    expect(screen.getByText('hello from provider')).toBeTruthy();
  });
});
