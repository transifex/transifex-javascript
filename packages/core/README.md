# Transifex Javascript Core

A general purpose Javascript library for localizing web apps using Transifex Native.

Requires a Transifex Native Project Token.

Supported Node.js versions >= 10.x.x

## Quick starting guide

Install the library using:

```npm install @transifex/core --save```

### Webpack

```js
import {
  Transifex,
  PROJECT_TOKEN
  SOURCE_LANG_CODE
} from '@transifex/core';

// initialize SDK
Transifex.init({
  [PROJECT_TOKEN]: '<PUBLIC PROJECT TOKEN>',
  [SOURCE_LANG_CODE]: 'en',
});

async function main() {
  // get all languages
  const languages = await Transifex.getAvailableLanguages();
  console.log(languages);

  // set target language, this will fetch translations Over The Air
  await Transifex.setSelectedLanguage('fr');

  // translate something
  const message = Transifex.t('Welcome {user}', {user: 'Joe'});
  console.log(message);
}

main();
```

### Node.js

```js
const {
  Transifex,
  PROJECT_TOKEN
  SOURCE_LANG_CODE
} = require('@transifex/core');

// initialize SDK
Transifex.init({
  [PROJECT_TOKEN]: '<PUBLIC PROJECT TOKEN>',
  [SOURCE_LANG_CODE]: 'en',
});

async function main() {
  // get all languages
  const languages = await Transifex.getAvailableLanguages();
  console.log(languages);

  // set target language, this will fetch translations Over The Air
  await Transifex.setSelectedLanguage('fr');

  // translate something
  const message = Transifex.t('Welcome {user}', {user: 'Joe'});
  console.log(message);
}

main();
```

### Browser

```html
<script type="text/javascript" src="transifex/browser.core.js"></script>
<script type="text/javascript">
  // initialize SDK
  Transifex.init({
    [Transifex.PROJECT_TOKEN]: '<PUBLIC PROJECT TOKEN>',
    [Transifex.SOURCE_LANG_CODE]: 'en',
  });

  // get all languages
  Transifex.getAvailableLanguages().then(function(languages) {
    console.log(languages);
    return Transifex.setSelectedLanguage('fr')
  }).then(function() {
    // translate something
    const message = Transifex.t('Welcome {user}', {user: 'Joe'});
    console.log(message);
  });
}
</script>
```

## API

### Setup

```js
// Webpack
import { init, setConfig, getConfig } from '@transifex/core';
// Webpack alternative
import { Transifex } from '@transifex/core';
const { init, setConfig, getConfig } = Transifex;

// Node
const { init, setConfig, getConfig } = require('@transifex/core');
// Node alternative
const { Transifex } = require('@transifex/core');
const { init, setConfig, getConfig } = Transifex;

// Similar for all constants
const { CDS_URL... } = Transifex;
```

#### Initialize library

```js
init({
  // CDS endpoint, defaults to https://cds.svc.transifex.net
  [CDS_URL]: String,

  // Public project token, defaults to empty string
  [PROJECT_TOKEN]: String,

  // Source language code, defaults to empty string
  [SOURCE_LANG_CODE]: String,

  // Translation missing policy, defaults to MISSING_POLICY_SOURCE
  [MISSING_POLICY]: MISSING_POLICY_SOURCE | MISSING_POLICY_PSEUDO,

  // Error policy, defaults to ERROR_POLICY_SOURCE
  [ERROR_POLICY]: ERROR_POLICY_SOURCE | ERROR_POLICY_THROW,
})
```

#### Set settings

Similar to init but for a single property.

```js
setConfig(property, value)
property:
  CDS_URL
  PROJECT_TOKEN
  SOURCE_LANG_CODE
  MISSING_POLICY
  ERROR_POLICY

// Example
setConfig(MISSING_POLICY, MISSING_POLICY_PSEUDO)
```

#### Get settings

```js
getConfig(property): String(value)

// Example
console.log(getConfig(SOURCE_LANG_CODE))
```

### Languages

#### Get available languages

Fetches list of project languages from CDS, useful for creating a language picker.

```js
getAvailableLanguages(): Promise([
  name: String,
  code: String,
  localized_name: String,
  rtl: Boolean
])

// Example
getAvailableLanguages().
  then(languages => console.log(languages)).
  catch(err => console.log(err))
```

#### Set selected translation language

Fetches translated content from the CDS and stores it in the cache. When the
promise returns, all content will be translated to that language.

```js
setSelectedLanguage(langCode): Promise

// Example
setSelectedLanguage().
  then(() => console.log('content loaded')).
  catch(err => console.log(err))
```

#### Get selected translation language

Returns the currently selected language code.

```js
getSelectedLanguage(): String(langCode)

// Example
console.log(getSelectedLanguage())
```

### Content translation

#### Escaped translation

Returns the translation of the passed source string based on the
currenly selected language. If the translation is not found, the returned
string is handled by the configured missing policy. If an error occurs in the
ICU parsing of the string, the error is handled based on the configured error policy.

**The translation is always returned escaped and it is safe to be used inside the HTML document.**

```js
t(sourceString, options): String(localizedString)
sourceString: String(ICU syntax string)
options: Object({
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

  // ICU variables, plurals, gender etc
  ...icu variables...
})


// Example
console.log(
  t('Hello {username}', { username: 'Joe' })
)
```

#### Unescaped translation

Similar to `t` function but returns the translation unescaped, useful for
translating HTML content.

By default all ICU variables are escaped, unless the `_safe: true` is passed in the options.

```js
ut(sourceString, options): String(localizedString)
sourceString: String(ICU HTML syntax string)
options: Object({
    _safe: Boolean,
    ...
    ...icu variables...
})

// Example
console.log(
  t('<b>Hello {username}</b>', { username: 'Joe' })
)
```

### Events

Library for listening to various async events.

```js
// listen to event
onEvent(type, function)
type:
  FETCHING_CONTENT
  CONTENT_FETCHED
  CONTENT_FETCH_FAILED
  LANGUAGE_CHANGED
  FETCHING_LANGUAGES
  LANGUAGES_FETCHED
  LANGUAGES_FETCH_FAILED

// stop listening event
offEvent(type, function)

// trigger an event
sendEvent(type, payload)
```
