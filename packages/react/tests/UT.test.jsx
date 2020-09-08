/* globals describe, it, expect, afterEach */

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import { UT } from '../src';

describe('UT', () => {
  afterEach(cleanup);

  it('renders HTML', () => {
    const message = 'Hello <b>Unsafe HTML</b>';
    render(<UT _str={message} />);
    expect(screen.queryByText('Unsafe HTML')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).toBeInTheDocument();
  });

  it('renders inline HTML', () => {
    const message = 'Hello <b>Inline HTML</b>';
    render(<UT _str={message} _inline />);
    expect(screen.queryByText('Inline HTML')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).toBeInTheDocument();
  });
});
