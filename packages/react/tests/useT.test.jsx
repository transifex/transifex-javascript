/* globals describe, it, expect, afterEach */

import React, { useState } from 'react';

import {
  render, screen, cleanup, fireEvent, act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { sendEvent, LOCALE_CHANGED } from '@transifex/native';
import { useT } from '../src';

describe('useT', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders text', () => {
    function MyComp() {
      const message = useT('Hello <b>safe text</b>');
      return (message);
    }

    render(<MyComp />);
    expect(screen.queryByText('Hello <b>safe text</b>')).toBeInTheDocument();
  });

  it('renders text with param', () => {
    function MyComp() {
      const message = useT('Hello <b>{username}</b>', {
        username: 'JohnDoe',
      });
      return (message);
    }

    render(<MyComp />);
    expect(screen.queryByText('Hello <b>JohnDoe</b>')).toBeInTheDocument();
  });

  it('rerenders on prop change', () => {
    const MyComp = () => {
      const [word, setWord] = useState('');
      const message = useT('hello {word}', {
        word,
      });
      return (
        <>
          <input value={word} onChange={(e) => setWord(e.target.value)} />
          <p>{message}</p>
        </>
      );
    };
    render(<MyComp />);
    fireEvent.change(
      screen.getByRole('textbox'),
      { target: { value: 'world' } },
    );
    expect(screen.getByText('hello world')).toBeTruthy();
  });

  it('renders react elements', () => {
    const MyComp = () => {
      const [word, setWord] = useState('');
      const message = useT('hello {w}', {
        w: <b>world</b>,
      });
      return (
        <>
          <input value={word} onChange={(e) => setWord(e.target.value)} />
          <p>{message}</p>
        </>
      );
    };
    render(<MyComp />);
    expect(screen.getByText('world')).toBeTruthy();
    act(() => {
      sendEvent(LOCALE_CHANGED);
    });
  });
});
