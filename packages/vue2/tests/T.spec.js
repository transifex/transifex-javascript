/**
 * @jest-environment jsdom
 */
/* globals describe, it, expect, afterEach */

import {
  render, screen, cleanup, fireEvent,
} from '@testing-library/vue';
import '@testing-library/jest-dom';
import { T } from '../src/index';

describe('T', () => {
  afterEach(cleanup);

  it('renders text', () => {
    const message = 'Hello <b>safe text</b>';
    render(T, {
      props: { _str: message },
    });
    expect(screen.queryByText(message)).toBeInTheDocument();
  });

  it('renders text with param', () => {
    const message = 'Hello <b>{username}</b>';
    render(T, {
      props: {
        _str: message,
        username: 'JohnDoe',
      },
    });
    expect(screen.queryByText('Hello <b>JohnDoe</b>')).toBeInTheDocument();
  });

  it('rerenders on prop change', async () => {
    const MyComp = {
      template: `
          <div>
            <input value="string" v-model="string" />
            <p><T _str="hello {word}" :word="string" /></p>
          </div>
      `,
      data() {
        return {
          string: '',
        };
      },
      components: {
        T,
      },
    };

    render(MyComp);
    const input = screen.getByRole('textbox');

    await fireEvent.update(input, 'world');
    expect(screen.getByText('hello world')).toBeTruthy();
  });
});
