# Transifex Javascript Core

Generic Javascript library for localizing web apps using Transifex Native.

Requires a Transifex Native Project Token.

Supported Node versions >= 10.x.x

## Webpack usage

Install the library using:

```npm install @transifex/core --save```

In the code use as:

```js
import { t, configure, getAllLanguages, setLanguage } from '@transifex/core';
import { PROJECT_TOKEN } from '@transifex/core';

// All imports are also available under a Transifex object
// For example:
// import { Transifex } from '@transifex/core';
// Transifex.t(..) Transifex.configure(..) etc

// initialize SDK
configure({
  [PROJECT_TOKEN]: '<PUBLIC PROJECT TOKEN>',
});

async function main() {
  // get all languages
  const languages = await getAllLanguages();
  console.log(languages);

  // set target language, this will fetch translations Over The Air
  await setLanguage('fr');

  // translate something
  const message = t('Welcome {user}', {user: 'Joe'});
  console.log(message);
}

main();
```

## Node usage

Install the library using:

```npm install @transifex/core --save```

In the code use as:

```js
const { Transifex, PROJECT_TOKEN, t } = require('@transifex/core');

// initialize SDK
Transifex.configure({
  [PROJECT_TOKEN]: '<PUBLIC PROJECT TOKEN>',
});

async function main() {
  // get all languages
  const languages = await Transifex.getAllLanguages();
  console.log(languages);

  // set target language, this will fetch translations Over The Air
  await Transifex.setLanguage('fr');

  // translate something
  const message = t('Welcome {user}', {user: 'Joe'});
  console.log(message);
}

main();
```
