# Transifex Native for Javascript

A general purpose Javascript library for localizing web apps using [Transifex Native](https://www.transifex.com/native/).

Requires a Transifex Native Project Token.

Supported Node.js versions >= `10.x.x`

Related packages:
* [@transifex/react](https://www.npmjs.com/package/@transifex/react)
* [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

## Quick starting guide

Install the library using:

```npm install @transifex/native --save```

### Webpack

```js
import { tx, t } from '@transifex/native';

// initialize
tx.init({
  token: '<PUBLIC PROJECT TOKEN>',
});

async function main() {
  // set target language, this will fetch translations Over The Air
  await tx.setCurrentLocale('el');

  // translate something
  const message = t('Welcome {user}', {user: 'Joe'});
  console.log(message);

  // get supported languages in order to create a language picker
  const languages = await tx.getLanguages();
  console.log(languages);
  /*
  [{
    name: 'Greek',
    code: 'el',
    localized_name: 'Ελληνικά',
    rtl: false,
  },{
  ...
  }]
  */
}

main();
```

### Node.js

```js
const { tx, t } = require('@transifex/native');

// initialize
tx.init({
  token: '<PUBLIC PROJECT TOKEN>',
});

...
```

### Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@transifex/native/dist/browser.native.min.js"></script>
<script type="text/javascript">
  const tx = Transifex.tx;
  const t = Transifex.t;

  // initialize SDK
  tx.init({
    token: '<PUBLIC PROJECT TOKEN>',
  });

  // get all languages
  tx.setCurrentLocale('fr').then(function() {
    // translate something
    const message = t('Welcome {user}', {user: 'Joe'});
    console.log(message);
  });
}
</script>
```

## API

#### Initialize library

```js
tx.init({
  // Public project token, defaults to empty string
  token: String,

  // CDS endpoint, defaults to https://cds.svc.transifex.net
  cdsHost: String,

  // Missing translation policy, defaults to "new SourceStringPolicy()"
  missingPolicy: Function,

  // Error policy, defaults to "new SourceErrorPolicy()"
  errorPolicy: Function,

  // Translation cache, defaults to "new MemoryCache()"
  cache: Function,
})
```

### Languages

Fetches list of project languages from CDS, useful for creating a language picker.

```js
tx.getLanguages(): Promise([
  {
    name: String,
    code: String,
    localized_name: String,
    rtl: Boolean
  },
  ...
])

// Example
tx.getLanguages().
  then(languages => console.log(languages)).
  catch(err => console.log(err))
```

Get a list of available locales based on CDS.

```js
tx.getLocales(): Promise(['code', 'code',...])
```

#### Set current translation language

Fetches translations from the CDS and stores them in cache. When the
promise returns, all content will be translated to that language.

```js
tx.setCurrentLocale(localeCode): Promise

// Example
tx.setCurrentLocale('el').
  then(() => console.log('content loaded')).
  catch(err => console.log(err))
```

#### Get current translation language

Returns the currently selected language code.

```js
tx.getCurrentLocale(): String(localeCode)

// Example
console.log(tx.getCurrentLocale())
```

### Content translation

Returns the translation of the passed source string based on the
currenly selected language. If the translation is not found, the returned
string is handled by the configured missing policy. If an error occurs in the
ICU parsing of the string, the error is handled based on the configured error policy.

**The translation is returned unescaped and it is NOT safe to be used inside the HTML document unless escaped**

```js
t(sourceString, params): String(localizedString)
sourceString: String(ICU syntax string)
params: Object({
  // optional string context, affects key generation
  _context: String,

  // optional developer comment
  _comment: String,

  // optional character limit instruction for translators
  _charlimit: Number,

  // optional comma separated list of tags
  _tags: String,

  // optional custom key
  _key: String,

  // optionally escape ICU variables
  _escapeVars: Boolean,

  // ICU variables, plurals, gender etc
  ...icu variables...
})


// Example
console.log(
  t('Hello <b>{username}</b>', { username: 'Joe' })
)
// "Hello <b>Joe</b>"
```

### Escaping translations

Using the translation as is from the `t` function inside HTML is dangerous for
XSS attacks. The translation must be escaped based on two scenarios.

#### Escaping text translations

```js
import { t, escape } from '@transifex/native';

const translation = escape(t('Hello {username}', { username }));
// translation is safe to include in HTML
```

#### Escaping HTML source

HTML source content cannot be globally escaped. In that case, we can just escape
the ICU variables using the `_escapeVars` parameter.

```js
import { t } from '@transifex/native';

const html = t('<b>Hello {username}</b>', {
  username: username,
  _escapeVars: true,
});
```

### Events

Library for listening to various async events.

```js
// listen to event
onEvent(type, function)
type:
  FETCHING_TRANSLATIONS
  TRANSLATIONS_FETCHED
  TRANSLATIONS_FETCH_FAILED
  LOCALE_CHANGED
  FETCHING_LOCALES
  LOCALES_FETCHED
  LOCALES_FETCH_FAILED

// stop listening event
offEvent(type, function)

// trigger an event
sendEvent(type, payload, caller)
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
