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

The T-component can accept React elements as properties and they will be
rendered properly, ie this would be possible:

```javascript
<T
  _str="A {button} and a {bold} walk into a bar"
  button={<button><T _str="button" /></button>}
  bold={<b><T _str="bold" /></b>} />
```

This will render like this in English:

```html
A <button>button</button> and a <b>bold</b> walk into a bar
```

And like this in Greek:

```html
Ένα <button>κουμπί</button> και ένα <b>βαρύ</b> μπαίνουν σε ένα μπαρ
```

Assuming the translations look like this:

| source                                  | translation                                      |
|-----------------------------------------|--------------------------------------------------|
| A {button} and a {bold} walk into a bar | Ένα {button} και ένα {bold} μπαίνουν σε ένα μπαρ |
| button                                  | κουμπί                                           |
| bold                                    | βαρύ                                             |

The main thing to keep in mind is that the `_str` property to the T-component
must **always** be a valid ICU messageformat template.

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
| _inline | Boolean | Wrap translation in `span` |

_Note: If you supply React elements as properties to the `UT` component, it
will misbehave by rendering `[object Object]`. Only use React elements as
properties with the `T` component._

### `useT` hook

Makes the current component re-render when a language change is detected and
returns a t-function you can use to translate strings programmatically.

You will most likely prefer to use the `T` or `UT` components over this, unless
for some reason you want to have the translation output in a variable for
manipulation.

```javascript
import React from 'react';

import { useT } from '@transifex/react';

function Capitalized() {
  const t = useT();
  const message = t('Hello world');
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

### `useLocale` hook

Returns a state variable with the currently selected locale.

```jsx
import React from 'react';
import { useLocale } from '@transifex/react';

function DisplayLocale () {
  const locale = useLocale();
  return (
    <p>Currently selected locale is {locale}</p>
  );
}
```

### `LanguagePicker` component

Renders a `<select>` tag that displays supported languages and switches the
application's selected language on change.
Uses `useLanguages` and `useLocale` internally.

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

- `className`: The CSS class that will be applied to the `<select>` tag

If you want something different than a `<select>`, it should be easy to write
your own language picker using `useLanguages`:

```jsx
import React from 'react';
import { tx } from '@transifex/native';
import { useLanguages, useLocale } from '@transifex/react';

function MyLanguagePicker () {
  const languages = useLanguages();
  const locale = useLocale();

  return (
    <>
      {languages.map(({ code, name }) => (
        <button key={code} onClick={() => tx.setCurrentLocale(code)}>
          {name} {locale === code ? '(selected)' : ''}
        </button>
      ))}
    </>
  );
}
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
