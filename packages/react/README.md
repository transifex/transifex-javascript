<p align="center">
  <a href="https://www.transifex.com">
    <img src="https://raw.githubusercontent.com/transifex/transifex-javascript/master/media/transifex.png" height="60">
  </a>
</p>
<p align="center">
  <i>Transifex Native is a full end-to-end, cloud-based localization stack for moderns apps.</i>
</p>
<p align="center">
  <img src="https://github.com/transifex/transifex-javascript/actions/workflows/npm-publish.yml/badge.svg">
  <a href="https://www.npmjs.com/package/@transifex/react">
    <img src="https://img.shields.io/npm/v/@transifex/react.svg">
  </a>
  <a href="https://developers.transifex.com/docs/native">
    <img src="https://img.shields.io/badge/docs-transifex.com-blue">
  </a>
</p>

# Transifex Native SDK: React i18n

React component for localizing React application using
[Transifex Native](https://www.transifex.com/native/).

Related packages:
- [@transifex/native](https://www.npmjs.com/package/@transifex/native)
- [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

Learn more about Transifex Native in the [Transifex Developer Hub](https://developers.transifex.com/docs/native).

# How it works

**Step1**: Create a Transifex Native project in [Transifex](https://www.transifex.com).

**Step2**: Grab credentials.

**Step3**: Internationalize the code using the SDK.

**Step4**: Push source phrases using the `@transifex/cli` tool.

**Step5**: Translate the app using over-the-air updates.

No translation files required.

![native](https://raw.githubusercontent.com/transifex/transifex-javascript/master/media/native.gif)

# Upgrade to v2

If you are upgrading from the `1.x.x` version, please read this [migration guide](https://github.com/transifex/transifex-javascript/blob/HEAD/UPGRADE_TO_V2.md), as there are breaking changes in place.


# Install

Install the library and its dependencies using:

```sh
npm install @transifex/native @transifex/react --save
```

# Usage

## `T` Component

### Regular usage

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

### Interpolation of React elements

The T-component can accept React elements as properties and they will be
rendered properly, ie this would be possible:

```javascript
<T
  _str="A {button} and a {bold} walk into a bar"
  button={<button><T _str="button" /></button>}
  bold={<b><T _str="bold" /></b>} />
```

Assuming the translations look like this:

| source                                  | translation                                      |
|-----------------------------------------|--------------------------------------------------|
| A {button} and a {bold} walk into a bar | Ένα {button} και ένα {bold} μπαίνουν σε ένα μπαρ |
| button                                  | κουμπί                                           |
| bold                                    | βαρύ                                             |

This will render like this in English:

```html
A <button>button</button> and a <b>bold</b> walk into a bar
```

And like this in Greek:

```html
Ένα <button>κουμπί</button> και ένα <b>βαρύ</b> μπαίνουν σε ένα μπαρ
```

The main thing to keep in mind is that the `_str` property to the T-component
must **always** be a valid ICU messageformat template.

### Translatable body

Another way to use the T-component is to include a translatable body that is a
mix of text and React elements:

```javascript
<T>
  A <button title="button!!!">button</button> and a <b>bold</b> walk into a bar
</T>
```

If you do this, the string that will be sent to Transifex for translation will
look like this:

```
A <1>button</1> and a <2>bold</2> walk into a bar
```

As long as the translation respects the numbered tags, the T-component will
render the translation properly. Any props that the React elements have in the
source version of the text will be applied to the translation as well.

You must not inject any javascript code in the content of a T-component because:

1. It will be rendered differently every time and the SDK won't be able to
   predictably find a translation
2. The CLI will not be able to extract a source string from it

You can interpolate parameters as before, but you have to be careful with how
you define them in the source body:

```javascript
// ✗ Wrong, this is a javascript expression
<T username="Bill">hello {username}</T>

// ✓ Correct, this is a string
<T username="Bill">hello {'{username}'}</T>
```

This time however, the interpolated values **cannot** be React elements.

```javascript
// ✗ Wrong, this will fail to render
<T bold={<b>BOLD</b>}>This is {'{bold}'}</T>
```


## `UT` Component

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

## `useT` hook

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

Optionally `useT` can take as param a custom Native Instance:

```javascript
import { useT } from '@transifex/react';
import { createNativeInstance } from '@transifex/native';

const customTX = createNativeInstance({
  token: 'token',
  secret: 'secret',
});

function Component() {
  const t = useT(customTX);
  // ...
}
```

## `useLanguages` hook

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

Optionally `useLanguages` can take as param a custom Native Instance:

```javascript
import { useT } from '@transifex/react';
import { createNativeInstance } from '@transifex/native';

const customTX = createNativeInstance({
  token: 'token',
  secret: 'secret',
});

function Component() {
  const languages = useLanguages(customTX);
  // ...
}
```

## `useLocale` hook

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

Optionally `useLocale` can take as param a custom Native Instance:

```javascript
import { useT } from '@transifex/react';
import { createNativeInstance } from '@transifex/native';

const customTX = createNativeInstance({
  token: 'token',
  secret: 'secret',
});

function Component() {
  const locale = useLocale(customTX);
  // ...
}
```

## `useTX` hook

Returns a state variable with the Native instance.

```jsx
import React from 'react';
import { useTX } from '@transifex/react';

function SetLocale () {
  const tx = useTX();
  return (
    <button onClick={() => tx.setCurrentLocale('el')}>
      Set to Greek
    </button>
  );
}
```

## `LanguagePicker` component

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

## `useTranslations` hook - aka Lazy Loading

Fetches translations tagged with a specific combination of tags when a
component first renders. This way, you can pull translations from the CDS in
batches and only when needed:

```jsx
tx.init({ token: ..., filterTags: 'home' });

export default function App() {
  return (
    <>
      <T _str="This will be translated as soon as possible" _tags="home" />
      {someCondition() && <Inner />}
    </>
  );
}

function Inner() {
  useTranslations('inner');
  return <T
    _str="This will be translated when the inner component is rendered"
    _tags="inner" />;
}
```

The hook returns a boolean state variable called `ready` that you can use to
handle a loading state:

```jsx
function Inner() {
  const { ready } = useTranslations('inner');
  if (!ready) { return 'Loading...'; }
  return <T
    _str="This will be translated when the inner component is rendered"
    _tags="inner" />;
}
```

_If you don't handle the loading state, the source string will be rendered
first and then replaced with the translation when it becomes available._

You can also use the hook in parent components that don't need the tagged
translations themselves. This will make the translations available sooner for
child components that may potentially need them:

```jsx
tx.init({ token: ..., filterTags: 'home' });

export default function App() {
  const { ready: innerReady } = useTranslations('inner');
  return (
    <>
      <T _str="This will be translated as soon as possible" _tags="home" />
      {someCondition() && <Inner ready={innerReady} />}
    </>
  );
}

function Inner({ ready }) {
  if (!ready) { return 'Loading...'; }
  return <T
    _str="This will be translated when the inner component is rendered"
    _tags="inner" />;
}
```

Optionally `useTranslations` can take as a second param a custom Native Instance:

```javascript
import { useT } from '@transifex/react';
import { createNativeInstance } from '@transifex/native';

const customTX = createNativeInstance({
  token: 'token',
  secret: 'secret',
});

function Component() {
  const { ready } = useTranslations('inner', customTX);
  // ...
}
```

## `TXProvider` provider
If you need to use more than one Transifex Native instances - like for example if you have a component library - you can use this provider to pass the desired instance to the children components.

```js
import { tx, createNativeInstance } from '@transifex/native';
import { TXProvider, LanguagePicker, T } from '@transifex/react';

const myOtherTXInstance = createNativeInstance();
myOtherTXInstance.init({ token: 'othertoken' })

tx.init({
  token: 'token',
});

// Make tx aware of the other instances so they can be synced when changing
// language
tx.controllerOf(myOtherTXInstance);

export default function App() {
  return (
    <>
      <LanguagePicker />
      <TXProvider instance={myOtherTXInstance}>
        <T _str="Hello {username}" username="John" />
      </TXProvider>
      <T _str="Hello World" />
    </>
  );
}
```

# Next.js

## App Router

All components and hooks in this package are Client Components (they rely on
React hooks and context), and the built bundle is published with the
`"use client"` directive. This means you can import `T`, `UT`, `LanguagePicker`,
`TXProvider` and the hooks directly inside the Next.js App Router without getting
the "you're importing a component that needs `useState` ..." error, as long as
they render inside a Client Component subtree.

Because the App Router renders on the server across concurrent requests, do
**not** rely on the global `tx` singleton for server rendering. Instead create a
per-request instance with `createNativeInstance` so locales from different
requests cannot leak into each other.

### Rendering translations in a Server Component

Create a small per-request helper:

```js
// app/i18n/getServerTx.js
import { createNativeInstance, normalizeLocale } from '@transifex/native';

export async function getServerTx(locale) {
  const txLocale = normalizeLocale(locale); // e.g. pt-br -> pt_BR
  const instance = createNativeInstance({
    token: process.env.NEXT_PUBLIC_TRANSIFEX_TOKEN,
    currentLocale: txLocale,
  });
  await instance.fetchTranslations(txLocale);
  return instance;
}
```

Use it inside an async Server Component (for example a `[locale]` segment):

```jsx
// app/[locale]/page.jsx
import { getServerTx } from '../i18n/getServerTx';

export default async function Page({ params }) {
  const { locale } = await params;
  const tx = await getServerTx(locale);
  return <h1>{tx.t('Hello world')}</h1>;
}
```

> In Next.js 15+, `params` is a Promise and must be awaited (as shown above).
> In Next.js 14 and earlier, `params` is a plain object, so you can read
> `params.locale` directly without `await`.

You can enumerate the available locales for `generateStaticParams` with
`tx.getLocales()`.

### Hydrating Client Components

For interactive parts that use `T`, hooks or the `LanguagePicker`, fetch the
translations on the server and pass them into a Client Component that seeds a
`TXProvider`:

```jsx
// app/i18n/TxClientProvider.jsx
'use client';

import { useMemo } from 'react';
import { createNativeInstance } from '@transifex/native';
import { TXProvider } from '@transifex/react';

export default function TxClientProvider({ locale, translations, children }) {
  const instance = useMemo(() => {
    const tx = createNativeInstance({ currentLocale: locale });
    tx.cache.update(locale, translations);
    return tx;
  }, [locale, translations]);

  return <TXProvider instance={instance}>{children}</TXProvider>;
}
```

```jsx
// app/[locale]/layout.jsx  (Server Component)
import { normalizeLocale } from '@transifex/native';
import { getServerTx } from '../i18n/getServerTx';
import TxClientProvider from '../i18n/TxClientProvider';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const txLocale = normalizeLocale(locale);
  const tx = await getServerTx(locale);
  const translations = tx.cache.getTranslations(txLocale);

  return (
    <TxClientProvider locale={txLocale} translations={translations}>
      {children}
    </TxClientProvider>
  );
}
```

Client Components rendered inside the provider can then use `T` and the hooks as
usual.

### App Router notes and limitations

- The App Router does not use the `i18n` option in `next.config.js`. Set up
  locale routing with a `[locale]` dynamic segment (or middleware) instead.
- `publicRuntimeConfig` is not available in the App Router. Use environment
  variables (`NEXT_PUBLIC_*`) for the public token.
- Live language switching, over-the-air auto-refresh and `LanguagePicker`
  require Client Components.
- Server-side rendering of translations (`tx.t(...)` in a Server Component) uses
  the per-request instance and does not ship JavaScript for that content.

## Pages Router

The Pages Router uses Next.js built-in [Internationalized Routing](https://nextjs.org/docs/pages/building-your-application/routing/internationalization)
(`i18n` in `next.config.js`) together with `getServerSideProps` to fetch
translations on the server and hydrate the client. In this model the global `tx`
singleton is the recommended approach — each `getServerSideProps` call runs in
isolation per request.

### Configure locales and token

```js
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'fr', 'de', 'pt-BR'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  publicRuntimeConfig: {
    TxNativePublicToken: process.env.NEXT_PUBLIC_TRANSIFEX_TOKEN,
  },
};
```

### Create a Transifex utility

```js
// lib/i18n.js
import { tx, normalizeLocale } from '@transifex/native';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

/**
 * Used by SSR to pass translations to the browser.
 *
 * @param {{ locale: string, locales: string[] }} context
 * @returns {{ locale: string, locales: string[], translations: object }}
 */
export async function getServerSideTranslations({ locale, locales }) {
  tx.init({
    token: publicRuntimeConfig.TxNativePublicToken,
  });

  const txLocale = normalizeLocale(locale);
  await tx.fetchTranslations(txLocale);

  return {
    locale,
    locales,
    translations: tx.cache.getTranslations(txLocale),
  };
}

/**
 * Initialize the client-side Transifex Native cache from server props.
 *
 * @param {{ locale: string, translations: object }} props
 */
export function setClientSideTranslations({ locale, translations }) {
  if (!locale || !translations) return;
  tx.init({ currentLocale: locale });
  tx.cache.update(locale, translations);
}
```

### Load translations per page

```jsx
// pages/index.js
import { T } from '@transifex/react';
import { getServerSideTranslations, setClientSideTranslations } from '../lib/i18n';

export default function Home(props) {
  setClientSideTranslations(props);

  return (
    <div>
      <T _str="Hello world" />
    </div>
  );
}

export async function getServerSideProps(context) {
  const data = await getServerSideTranslations(context);
  return { props: { ...data } };
}
```

### Set translations globally in `_app.js`

To avoid calling `setClientSideTranslations` on every page, initialize the
client cache once in your custom App:

```jsx
// pages/_app.js
import { setClientSideTranslations } from '../lib/i18n';

export default function MyApp({ Component, pageProps }) {
  setClientSideTranslations(pageProps);
  return <Component {...pageProps} />;
}
```

You still need `getServerSideProps` on each page that requires translations,
because `_app.js` does not support data fetching methods.

### Pages Router notes and limitations

- Locale routing is handled by Next.js `i18n` config — no `[locale]` segment or
  middleware is required.
- `publicRuntimeConfig` is available and is the documented way to pass the public
  token to server-side code.
- `T`, `UT`, hooks and `LanguagePicker` work directly in page components without
  a `"use client"` boundary (the Pages Router does not use React Server
  Components).
- For over-the-air translation refresh without a server restart, add a TTL-based
  refresh in `getServerSideTranslations` (see the
  [Next.js guide](https://developers.transifex.com/docs/nextjs#auto-refresh-translations)).
- For large sites, consider content splitting with tagged fetches to reduce data
  transfer.

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
