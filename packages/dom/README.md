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
  <a href="https://www.npmjs.com/package/@transifex/dom">
    <img src="https://img.shields.io/npm/v/@transifex/dom.svg">
  </a>
  <a href="https://developers.transifex.com/docs/native">
    <img src="https://img.shields.io/badge/docs-transifex.com-blue">
  </a>
</p>

# Transifex Native SDK: i18n DOM library

A utility library for managing the localization of generic HTML documents or fragments.
Taking as input a `document` object it:
- Applies string segmentation
- Extracts strings to be pushed to a Transifex Native project
- Can be combined with `@transifex/native` to localize HTML

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)

Learn more about Transifex Native in the [Transifex Developer Hub](https://developers.transifex.com/docs/native).

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

To append some tags to all exported strings do:

```js
txdom.getStringsJSON({
  tags: ['global-tag1', 'global-tag2'],
});
```

To add occurence information to all exported strings do:

```js
txdom.getStringsJSON({
  occurrences: ['file.js', 'https://example.com/home'],
});
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

# How string segmentation works

This is how the HTML content is segmented:

## Block HTML tags

Example of block tags are: `DIV`, `P`, `H1`, `TABLE`, `UL`, `OL` etc.

When the content of a block tag is a combination of plain text and inline elements such as `SPAN`, all the content is considered a single segment.

```html
HTML:
  <div>
    <p>This is a paragraph</p>
    <p>This is a paragraph with <span>inline element</span></p>
  <div>

Segments:
  "This is a paragraph"
  "This is a paragraph with <span>inline element</span>"
```

## Plain text

When the content of a block tag is NOT a combination of plain text and a tag, only the plain text content is extracted.

```html
HTML:
  <div>
    <p>
      <span>My span text</span>
      <span>Another span text</span>
    </p>
  </div>

Segments:
  "My span text"
  "Another span text"
```

## CSS Data Binding On The Angular or React Framework

CSS styles may also be used for data binding on the Angular or React framework. The DOM model is used to decipher the Angular or React framework. This entails that the text inside the Inline Element, is directly controlled by the Angular/React framework, as opposed to being modified through HTML (e.g. in the case of jQuery). Because of this, when a block tag is a combination of plain text and inline elements such as `SPAN` that use a data binding based. CSS style that is based on the Angular/React framework, the text attribute needs to be evaluated separately. This results in the creation of multiple segments.

```html
HTML:
<div>
  <p>This is a paragraph</p>
  <p>This is a paragraph with <span class="AngularReact">an inline element</span></p>
<div>

Segments:
"This is a paragraph"
"This is a paragraph with"
"an inline element"
```

## Page title

```html
HTML:
  <title>My title</title>

Segments:
  "My title"
```

## Anchor titles

```html
HTML:
  <a title="My title">..</a>

Segments:
  "My title"
```

## Image titles and alt text

```html
HTML:
  <img title="My title" alt="My alt text"/>

Segments:
  "My title"
  "My alt text"
```

## Input values and placeholders

Input values are only detected for inputs with type button, reset, submit.

## Textarea placeholders

```html
HTML:
  <textarea placeholder="My placeholder text">

Segments:
  "My placeholder text"
```

## Meta keywords and descriptions

```html
HTML:
  <meta name="keywords" content="tag1, tag2, tag3">
  <meta name="description" content="My page description">
  <meta name="title" content="My page title" >
  <meta property="og:title" content="Localization Platform for Translating Digital Content | Transifex">
  <meta property="og:description" content="Integrate with Transifex to manage the creation of multilingual websites and app content. Order translations, see translation progress, and tools like TM.">

Segments:
  "tag1, tag2, tag3"
  "My page description"
  "My page title"
  "Localization Platform for Translating Digital Content | Transifex"
  "Integrate with Transifex to manage the creation of multilingual websites and app content. Order translations, see translation progress, and tools like TM."
```

## Input elements of "image" type

```html
HTML:
  <input type="image" alt="Submit">

Segments:
  "Submit"
```

## SVG elements

SVG tags may contain some nested TEXT tags which are parsed and their strings extracted, but there is no MARKING in the UI for these elements. However, when you mouse over these elements, the options for the strings are shown (ignore string, follow link, etc.).

Elements that are ignored: `script, style, link, iframe, noscript, canvas, audio, video, code`.

Social widgets such as Facebook and Twitter that have tags with class names `facebook_container` and `twitter_container` are also ignored.

# How to handle non-translatable content

You can manually define a block or node as non-translatable by adding a `notranslate` class.

For example:

```
<div class="notranslate">This content will not be translated</div>
```

## Marking attributes for translation

Apart from the attributes that are automatically detected for translations, you can define custom attributes for translation using the `tx-attrs="attr1, attr2,..."` attribute.

Before:

```html
HTML:
  <span title="My title" data-content="My data content">

Segments: Nothing detected
```

After:

```html
HTML:
  <span title="My title" data-content="My data"
        tx-attrs="title, data-content">

Segments:
  "My title"
  "My data"
```

# How to tag strings in the source language

You can automatically tag source strings by using the `tx-tags="tag1, tag2,..."` attribute.

These tags propagate to child elements as well.

For example:

```
<div tx-tags="marketing">...</div>
```

# How to handle inline block variables

To define variables or placeholders within a block that shouldn't be translated, use `class="notranslate"` in the variable nodes or encapsulate them inside `var` tags.

For example:

```html
HTML:
  Hi, you are visitor <span class="notranslate">142</span>
  Hi, you are visitor <var>341</var>

Segments:
  "Hi, you are visitor {{0}}"
```

# How to handle URLs as translatable content

When images `<img>` or links `<a>` appear within a segment, their URLs are handled by default as non-translatable content (i.e variables).

## Translating images

To translate an image you should treat its URL as translatable text. To do so, use the special directive `tx-content="translate_urls"` to enable this functionality for a node and its children.

Before:

```html
HTML:
  <div>
    <img src="/uploads/smiley.jpg" alt="Smiley face" width="42" height="42">
  </div>

Segments:
  "<img src="{{0}}" alt="Smiley face" width="42" height="42">"
```

After:

```html
HTML:
  <div tx-content="translate_urls">
    <img src="/uploads/smiley.jpg" alt="Smiley face" width="42" height="42">
  </div>

Segments:
  "<img src="/uploads/smiley.jpg" alt="Smiley face" width="42" height="42">"
```

## Translating links

To translate a link you should treat each URL as translatable text. To do so, use the special directive `tx-content="translate_urls"` to enable this functionality for a node and its children.

Before:

```html
HTML:
  <div>
    Click to go to the <a href="/features">features</a> page
  </div>

Segments:
  "Click to go to the <a href="{{0}}">features</a> page"
```

After:

```html
HTML:
  <div tx-content="translate_urls">
    Click to go to the <a href="/features">features</a> page
  </div>

Segments:
  "Click to go to the <a href="/features">features</a> page"
```

>Tip: To treat ALL URLs as translatable content within a page, add the `tx-content="translate_urls"` to the opening `BODY` tag.

# How to define custom variables

If you want to use your own custom patterns and you are looking for a way to ignore such text handling this as a variable, then you can add custom rules on how variables are handled within a string segment.

For example:

```js
const txdom = new TxNativeDOM({
  variablesParser: (text, fn) => {
    // Example of replacing the value of an s-href attribute with a variable.
    // Input: Hello <a s-href="doc:example">Click here</a>
    // Output: Hello <a s-href="{{0}}">Click here</a>
    // We use a regular expression to match the attribute
    text = text.replace(/s-href="([^"]*)"/g, (a, b) => {
      // Group a contains: s-href="doc:example"
      // Group b contains: doc:example
      // fn function registers the content of "doc:example" as variable
      // in Live and returns a variable expression to replace it: {{0}}
      return a.replace(b, fn(b));
    });
    return text;
  },
});
```

# How to fine tune translatable content

For even finer control over how strings are detected, use the `tx-content` HTML attribute, which can contain the following values:
- `exclude` to mark a node and its children to be excluded from string detection
- `include` to mark a node and its children within a exclude block to be included in string detection
- `block` to mark a node and its children to be detected as a single string
- `notranslate_urls` to mark a node and its children to handle URLs as variables (default)
- `translate_urls` to mark a node and its children that URLs should be translated

Include/exclude example.

Before:

```html
HTML:
  <div>
    <p>First text</p>
    <p>Second text</p>
    <p>Third text</p>
  </div>

Segments:
  "First text"
  "Second text"
  "Third text"
```

After:

```html
HTML:
  <div tx-content="exclude">
    <p>First text</p>
    <p tx-content="include">Second text</p>
    <p>Third text</p>
  </div>

Segments:
  "Second text"
```

Block example.

Before:

```html
HTML:
  <div>
    <h1>A header</h1>
    <p>A paragraph</p>
  </div>

Segments:
  "A header"
  "A paragraph"
```

After:

```html
HTML:
  <div tx-content="block">
    <h1>A header</h1>
    <p>A paragraph</p>
  </div>

Segments:
  "<h1>A header</h1><p>A paragraph</p>"
```

> Note: Strings that match the following regular expression are ignored:
> ^( |\s|\d|[-\/:-?~@#!"^_`\.,\[\]])*$

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
