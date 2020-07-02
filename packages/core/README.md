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
  const languages = await Transifex.getAllLanguages();
  console.log(languages);

  // set target language, this will fetch translations Over The Air
  await Transifex.setLanguage('fr');

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
  const languages = await Transifex.getAllLanguages();
  console.log(languages);

  // set target language, this will fetch translations Over The Air
  await Transifex.setLanguage('fr');

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
  Transifex.getAllLanguages().then(function(languages) {
    console.log(languages);
    return Transifex.setLanguage('fr')
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

Initialize library

```js
init({
  [CDS_URL]: 'https://cds.svc.transifex.net', // CDS Endpoint
  [PROJECT_TOKEN]: '', // Public project token
  [SOURCE_LANG_CODE]: '', // Source language code
  [MISSING_POLICY]: MISSING_POLICY_SOURCE | MISSING_POLICY_PSEUDO,
})
```

Set settings
```js
setConfig(property, value)
<property>:
  CDS_URL
  PROJECT_TOKEN
  SOURCE_LANG_CODE
  MISSING_POLICY

// Example
setConfig(MISSING_POLICY, MISSING_POLICY_PSEUDO)
```

Get settings
```js
getConfig(property)

// Example
console.log(getConfig(SOURCE_LANG_CODE))
```

### Languages

Get available languages

```js
getAllLanguages(): Promise

// Example
getAllLanguages().
  then(languages => console.log(languages)).
  catch(err => console.log(err))
```

Set translation language

```js
setLanguage(langCode): Promise

// Example
setLanguage().
  then(() => console.log('content loaded')).
  catch(err => console.log(err))
```

Get translation language

```js
getLanguage()

// Example
console.log(getLanguage())
```

### Content translation

Escaped translation

```js
t(sourceString, options): localizedString
<sourceString>: ICU syntax string
<options>:
  {
    _context: '<optional string context>',
    ...icu variables...
  }


// Example
console.log(
  t('Hello {username}', { username: 'Joe' })
)
```

Unescaped translation

By default all ICU variables are escaped, unless the `_safe: true` is passed in the options.

```js
ut(sourceString, options): localizedString
<sourceString>: ICU syntax string (HTML)
<options>:
  {
    _context: '<optional string context>',
    _safe: <Bool>
    ...icu variables...
  }

// Example
console.log(
  t('<b>Hello {username}</b>', { username: 'Joe' })
)
```

### Events

```js
onEvent(type, function)
<type>:
  FETCHING_CONTENT
  CONTENT_FETCHED
  CONTENT_FETCH_FAILED
  LANGUAGE_CHANGED
  FETCHING_LANGUAGES
  LANGUAGES_FETCHED
  LANGUAGES_FETCH_FAILED

offEvent(type, function)

sendEvent(type, payload)
```
