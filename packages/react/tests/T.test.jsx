/* globals describe, it, expect, afterEach */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
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

  it('renders HTML', () => {
    const message = 'Hello <b>Unsafe HTML</b>';
    render(<T _str={message} _html />);
    expect(screen.queryByText('Unsafe HTML')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).toBeInTheDocument();
  });

  it('renders inline HTML', () => {
    const message = 'Hello <b>Inline HTML</b>';
    render(<T _str={message} _html _inline />);
    expect(screen.queryByText('Inline HTML')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).toBeInTheDocument();
  });
});
