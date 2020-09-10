# Transifex Native for React

React component for localizing React application using
[Transifex Native](https://www.transifex.com/native/).

Related packages:
- [@transifex/native](https://www.npmjs.com/package/@transifex/native)
- [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

## Install

Install the library and its dependencies using:

```sh
npm install @transifex/native @transifex/react --save
```

## Usage

### `T` Component

```javascript
import React from 'react';

import { T } from '@transifex/react';

function Example() {
  return (
    <div>
      <T _str="Hello world" />
      <T _str="Hello {username}" username={user} />
    </div>
  );
}

```

Available optional props:

| Prop       | Type   | Description                                 |
|------------|--------|---------------------------------------------|
| _context   | String | String context, affects key generation      |
| _key       | String | Custom string key                           |
| _comment   | String | Developer comment                           |
| _charlimit | Number | Character limit instruction for translators |
| _tags      | String | Comma separated list of tags                |

### `UT` Component

```javascript
import React from 'react';

import { UT } from '@transifex/react';

function Example () {
  return (
    <div>
      <UT _str="Hello <b>{username}</b>" username={user} />
      <p>
        <UT _str="Hello <b>{username}</b>" _inline username={user} />
      </p>
    </div>
  )
}
```

`UT` has the same behaviour as `T`, but renders source string as HTML inside a
`div` tag.

Available optional props: All the options of `T` plus:

| Prop    | Type    | Description                                     |
|---------|---------|-------------------------------------------------|
| _inline | Boolean | Wrap translation in `span` when `_html` is used |

### `useT` hook

Returns a state variable that will be automatically updated when the selected
language changes. Used internally by the `T` and `UT` components. Accepts the
same props as the `T` component.

You will most likely prefer to use the `T` or `UT` components over this, unless
for some reason you want to have the translation output in a variable for
manipulation.

```javascript
import React from 'react';

import { useT } from '@transifex/react';

function Capitalized() {
  const message = useT('Hello world');
  return <span>{message.toUpperCase()}</span>;
}
```

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
