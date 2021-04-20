/* globals describe, it, expect, afterEach */

import React, { useState } from 'react';
import {
  render, screen, cleanup, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { T } from '../src/index';

describe('T', () => {
  afterEach(cleanup);

  it('renders text', () => {
    const message = 'Hello <b>safe text</b>';
    render(<T _str={message} />);
    expect(screen.queryByText(message)).toBeInTheDocument();
  });

  it('renders text with param', () => {
    const message = 'Hello <b>{username}</b>';
    render(<T _str={message} username="JohnDoe" />);
    expect(screen.queryByText('Hello <b>JohnDoe</b>')).toBeInTheDocument();
  });

  it('rerenders on prop change', () => {
    const MyComp = () => {
      const [word, setWord] = useState('');
      return (
        <>
          <input value={word} onChange={(e) => setWord(e.target.value)} />
          <p><T _str="hello {word}" word={word} /></p>
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
    render(<T _str="hello {w}" w={<b>world</b>} />);
    expect(screen.getByText('world')).toBeTruthy();
  });
});
