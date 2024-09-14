<p align="center">
  <a href="https://www.wordsmith.is">
    <img src="https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/wordsmith.png" height="60">
  </a>
</p>
<p align="center">
  <i>Wordsmith Native is a full end-to-end, cloud-based localization stack for moderns apps.</i>
</p>
<p align="center">
  <img src="https://github.com/wordsmith/wordsmith-javascript/actions/workflows/npm-publish.yml/badge.svg">
  <a href="https://www.npmjs.com/package/@wordsmith/i18next">
    <img src="https://img.shields.io/npm/v/@wordsmith/i18next.svg">
  </a>
  <a href="https://developers.wordsmith.is/docs/native">
    <img src="https://img.shields.io/badge/docs-wordsmith.is-blue">
  </a>
</p>

# Wordsmith Native SDK: i18next backend plugin

An [i18next](https://www.i18next.com) backend plugin, to load translations over-the-air using Wordsmith Native.

Related packages:
* [@wordsmith/native](https://www.npmjs.com/package/@wordsmith/native)
* [i18next](https://www.npmjs.com/package/i18next)

Learn more about Wordsmith Native in the [Wordsmith Developer Hub](https://developers.wordsmith.is/docs/native).

# Quick starting guide

Install the library using:

```npm install @wordsmith/i18next --save```

## Webpack

```js
import { WordsmithI18next } from '@wordsmith/i18next';
const wsBackend = new WordsmithI18next({
  token: 'public token',
  // other options from @wordsmith/native init function
});

// add plugin to i18next
i18next.use(wsBackend).init(...);
```

## Node.js

```js
const { WordsmithI18next } = require('@wordsmith/i18next');
const wsBackend = new WordsmithI18next({
  token: 'public token',
  // other options from @wordsmith/native init function
});

// add plugin to i18next
i18next.use(wsBackend).init(...);
```

## Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@wordsmith/i18next/dist/browser.i18next.min.js"></script>
<script type="text/javascript">
  const WordsmithI18next = WsNativeI18next.WordsmithI18next;
  const wsBackend = new WordsmithI18next({
    token: 'public token',
    // other options from @wordsmith/native init function
  });

  // add plugin to i18next
  i18next.use(wsBackend).init(...);
</script>
```

# Uploading phrases for translation

You can use `@wordsmith/cli` to push i18next JSON files for translation. First step is to install the CLI tool
into the project using the command:

```
npm i @wordsmith/cli --save
```

Then, given that you have generated a source [i18next JSON v4](https://www.i18next.com/misc/json-format), use the following command to
upload to Wordsmith for translation.

```
npx wsjs-cli push source.json --parser=i18next
```

That's it. Given that the content is translated, translations will be downloaded over-the-air using the Wordsmith i18next backend.

# Known limitations

CLI does NOT parse and push the following key types:
- keyWithArrayValue
- keyWithObjectValue

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/wordsmith/wordsmith-javascript/blob/HEAD/LICENSE) file.
