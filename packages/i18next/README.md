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
  <a href="https://www.npmjs.com/package/@transifex/i18next">
    <img src="https://img.shields.io/npm/v/@transifex/i18next.svg">
  </a>
  <a href="https://developers.transifex.com/docs/native">
    <img src="https://img.shields.io/badge/docs-transifex.com-blue">
  </a>
</p>

# Transifex Native SDK: i18next backend plugin

An i18next backend plugin, to load translations over-the-air using Transifex Native.

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)
* [i18next](https://www.npmjs.com/package/i18next)

Learn more about Transifex Native in the [Transifex Developer Hub](https://developers.transifex.com/docs/native).

# Quick starting guide

Install the library using:

```npm install @transifex/i18next --save```

## Webpack

```js
import { TransifexI18next } from '@transifex/i18next';
const txBackend = new TransifexI18next({
  token: 'public token',
  // other options from @transifex/native init function
});

// add plugin to i18next
i18next.use(txBackend).init(...);
```

## Node.js

```js
const { TransifexI18next } = require('@transifex/i18next');
const txBackend = new TransifexI18next({
  token: 'public token',
  // other options from @transifex/native init function
});

// add plugin to i18next
i18next.use(txBackend).init(...);
```

## Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@transifex/i18next/dist/browser.i18next.min.js"></script>
<script type="text/javascript">
  const TransifexI18next = TxNativeI18next.TransifexI18next;
  const txBackend = new TransifexI18next({
    token: 'public token',
    // other options from @transifex/native init function
  });

  // add plugin to i18next
  i18next.use(txBackend).init(...);
</script>
```

# Uploading phrases for translation

You can use `@transifex/cli` to push i18next JSON files for translation. First step is to install the CLI tool
into the project using the command:

```
npm i @transifex/cli --save
```

Then, given that you have generated a source [i18next JSON v4](https://www.i18next.com/misc/json-format), use the following command to
upload to Transifex for translation.

```
npx txjs-cli push source.json --parser=i18next
```

That's it. Given that the content is translated, translations will be downloaded over-the-air using the Transifex i18next backend.

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
