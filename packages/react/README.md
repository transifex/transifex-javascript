# Transifex Native for React

React component for localizing React application using [Transifex Native](https://www.transifex.com/native/).

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)
* [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

## Install

Install the library and its dependencies using:

`npm install @transifex/native @transifex/react --save`

## Usage

### T component

```jsx
import React, { Component } from 'react';

import { T } from '@transifex/react';

class Example extends Component {
  render() {
    const user = 'Joe';
    return (
      <div>
        <T _str="Hello world" />
        <T _str="Hello {username}" username={user} />
        <T
          _str="Hello <b>{username}</b>"
          _html
          username={user}
        />
        <p>
          <T
            _str="Hello <b>{username}</b>"
            _html _inline
            username={user}
          />
        </p>
      </div>
    );
  }
}
```

Available optional props:
| Prop       | Type    | Description                                    |
| ---------- | ------- | ---------------------------------------------- |
| _str       | String  | Source string                                  |
| _html      | Boolean | Render source string as HTML inside a `div` tag|
| _inline    | Boolean | Wrap translation in `span` when `_html` is used|
| _context   | String  | String context, affects key generation         |
| _key       | String  | Custom string key                              |
| _comment   | String  | Developer comment                              |
| _charlimit | Number  | Character limit instruction for translators    |
| _tags      | String  | Comma separated list of tags                   |

### `useLanguages` hook

Returns a state variable that will eventually hold the supported languages of
the application. Makes an asynchronous call to the CDS.

```jsx
import React from 'react';
import { useLanguages } from '@transifex/react';

function LanguageList () {
  const languages = useLanguages();
  return (
    <ul>
      {languages.map(({ code, name }) => (
        <li key={code}>
          <strong>{code}</strong>: {name}
        </li>
      ))}
    </ul>
  );
}
```

### `LanguagePicker` component

Renders a `<select>` tag that displays supported languages and switches the
application's selected language on change. Uses `useLanguages` internally.

```jsx
import React from 'react';
import { T, LanguagePicker } from '@transifex/react';

function App () {
  return (
    <div>
      <T _str="This is a translatable message" />
      <LanguagePicker />
    </div>
  );
}
```

Accepts properties:

- `sourceLanguage`: defaults to `{code: 'en', name: 'English'}`
- `className`: The CSS class that will be applied to the `<select>` tag

If you want something different than a `<select>`, it should be easy to write
your own language picker using `useLanguages`:

```jsx
import React from 'react';
import { tx } from '@transifex/native';
import { useLanguages } from '@transifex/react';

function MyLanguagePicker () {
  const languages = useLanguages();

  return (
    <>
      <button onClick={() => tx.setCurrentLocale('en')}>
        English
      </button>
      {languages.map(({ code, name }) => (
        <button key={code} onClick={() => tx.setCurrentLocale(code)}>
          {name}
        </button>
      ))}
    </>
  );
}
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
