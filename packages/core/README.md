# Transifex Javascript Core

Generic Javascript library for localizing web apps using Transifex Native.

Requires a Transifex Native Project Token.

## Webpack usage

Install the library using:

```npm install @transifex/core --save```

In the code use as:

```js
import Transifex from '@transifex/core';

const { t, getAllLanguages, setLanguage } = Transifex;
const { PROJECT_TOKEN } = Transifex;

// initialize SDK
Transifex.config({
  [PROJECT_TOKEN]: '<PUBLIC PROJECT TOKEN>',
});

async function main() {
  // get all languages
  const languages = await getAllLanguages();
  console.log(languages);

  // set target language, this will fetch translation Over The Air
  await setLanguage('fr');

  // translate something
  const message = t('Welcome {user}', {user: 'Joe'});
  console.log(message);
}

main();
```
