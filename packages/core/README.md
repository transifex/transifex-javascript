# Transifex Javascript Core

Generic Javascript library for localizing web apps using Transifex Native.

Requires a Transifex Native Project Token.

Supported Node versions >= 10.x.x

## Webpack usage

Install the library using:

```npm install @transifex/core --save```

In the code use as:

```js
import { t, config, getAllLanguages, setLanguage } from '@transifex/core';
import { PROJECT_TOKEN } from '@transifex/core';

// All imports are also available under a Transifex object
// For example:
// import { Transifex } from '@transifex/core';
// Transifex.t(..) Transifex.config(..) etc

// initialize SDK
config({
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
