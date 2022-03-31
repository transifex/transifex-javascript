# Transifex Native DOM

A utility library for managing the localization of generic HTML documents or fragments.
Taking as input a `document` object it:
- Applies string segmentation
- Extracts strings to be pushed to a Transifex Native project
- Can be combined with `@transifex/native` to localize HTML

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)

# Quick starting guide

Install the library using:

```npm install @transifex/dom --save```

## Webpack

```js
import { TxNativeDOM } from '@transifex/dom';
const txdom = new TxNativeDOM();
```

## Node.js

```js
const { TxNativeDOM } = require('@transifex/dom');
const txdom = new TxNativeDOM();
```

## Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@transifex/dom/dist/browser.dom.min.js"></script>
<script type="text/javascript">
  const TxNativeDOM = TransifexDOM.TxNativeDOM;
  const txdom = new TxNativeDOM();
</script>
```

# API

## Initialize

By default, TxNativeDOM initializes with some sane defaults, that affect the
way strings are detected in the HTML, such tags or classes to ignore, or which
attributes to treat as text.

The contructor supports some additional customization.

```js
const txdom = new TxNativeDOM({
  // list of custom HTML tags to ignore
  ignoreTags: Array(String),

  // list of custom HTML class names to ignore
  ignoreClass: Array(string),

  // list of additional HTML attributes to treat as translatable text
  parseAttr: Array(String),

  // Custom variables parser:
  // function(text, func) { return text; }
  variablesParser: Function,
});
```

## Attach / detach DOM

Connect or disconnect a DOM with the library.

```js
txdom.attachDOM(document); // attach the whole document
txdom.attachDOM(document, root); // attach a specific node from the document

txdom.detachDOM(document); // detach the whole document
txdom.detachDOM(root); // detach a specific node from the document
```

## Translate DOM

Translate DOM using a `t` function or reset to source language.

```js
let locale = 'fr';
const t = (key) => {
  return 'translation';
}
txdom.toLanguage(locale, t);

// revert to source
txdom.toSource();
```

## Pseudo translate DOM

For debugging purpose you may use the built-in pseudo translation mode.

```js
// pseudo translate
txdom.pseudoTranslate();

// revert to source
txdom.toSource();
```

## Get source strings

Get a list of detected strings for localization. The JSON format is compatible with Transifex Native.

```js
txdom.getStringsJSON();
```

# Use cases

Transifex Native DOM works in the browser using `window.document` DOM or within
NodeJS using a DOM emulator, such as [jsdom](https://www.npmjs.com/package/jsdom),
[happy-dom](https://www.npmjs.com/package/happy-dom) and
[linkedom](https://www.npmjs.com/package/linkedom).

The following examples are documented using `jsdom`, but a `document` node is all required.

## Extract strings

```js
const { JSDOM } = require('jsdom');
const { createNativeInstance } = require('@transifex/native');
const { TxNativeDOM } = require('@transifex/dom');

// Create a Native instance for pushing content
const tx = createNativeInstance({
  token: 'token',
  secret: 'secret',
});

// a DOM instance
const txdom = new TxNativeDOM();

// A JSDOM instance to emulate DOM in NodeJS
const jsdom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

// Connect JSDOM instance with TXNativeDOM
txdom.attachDOM(jsdom.window.document);

// Get translatable strings
const stringsJSON = txdom.getStringsJSON();

// Push them to Transifex for translation
await tx.pushSource(stringsJSON);
```

## Translate HTML document

```js
const { JSDOM } = require('jsdom');
const { createNativeInstance } = require('@transifex/native');
const { TxNativeDOM } = require('@transifex/dom');

// Create a Native instance for pulling content
const tx = createNativeInstance({
  token: 'token',
});

// a DOM instance
const txdom = new TxNativeDOM();

// A JSDOM instance to emulate DOM in NodeJS
const jsdom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

// Connect JSDOM instance with TXNativeDOM
txdom.attachDOM(jsdom.window.document);

// Get translations
await tx.setCurrentLocale('fr');

// Translate DOM
txdom.toLanguage(tx.getCurrentLocale(), tx.t);

// Get back translated HTML
const translatedHTML = jsdom.serialize();
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
