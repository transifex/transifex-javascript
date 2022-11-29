/**
 * @jest-environment jsdom
 */
/* globals describe, it, expect, afterEach */

import { render, screen, cleanup } from '@testing-library/vue';
import '@testing-library/jest-dom';

import { UT } from '../src/index';

describe('UT', () => {
  afterEach(cleanup);

  it('renders HTML', () => {
    const MyComp = {
      template: `
        <UT _str="Hello <b>Unsafe HTML</b>" />
      `,
      components: {
        UT,
      },
    };
    render(MyComp);
    expect(screen.queryByText('Unsafe HTML')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).toBeInTheDocument();
  });

  it('renders inline HTML', () => {
    const MyComp = {
      template: `
        <UT _str="Hello <b>Inline HTML</b>" _inline=true />
      `,
      components: {
        UT,
      },
    };
    const { container } = render(MyComp);
    expect(screen.queryByText('Inline HTML')).toBeInTheDocument();
    expect(screen.queryByText('Hello')).toBeInTheDocument();
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
