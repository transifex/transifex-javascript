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
  <a href="https://www.npmjs.com/package/@transifex/express">
    <img src="https://img.shields.io/npm/v/@transifex/express.svg">
  </a>
  <a href="https://developers.transifex.com/docs/native">
    <img src="https://img.shields.io/badge/docs-transifex.com-blue">
  </a>
</p>

# Transifex Native SDK: Express i18n middleware

Express middleware for server side localization using [Transifex Native](https://www.transifex.com/native/).

Related packages:
- [@transifex/native](https://www.npmjs.com/package/@transifex/native)
- [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

Learn more about Transifex Native in the [Transifex Developer Hub](https://developers.transifex.com/docs/native).

## Quick start

Install the necessary express packages:

```shell
npm install --save express cookie-parser body-parser ...
```

And the Transifex Native integration:

```shell
npm install --save @transifex/native @transifex/express
```

Create an express app and attach the necessary middleware:

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
```

Import the Transifex Native libraries and set up:

```javascript
const { TxExpress } = require('@transifex/express');

const txExpress = new TxExpress({ token: '...' });
app.use(txExpress.middleware());
app.post('/i18n', txExpress.setLocale());
```

> All options passed to the `TxExpress`'s constructor that are not handled by it
> will be passed on to `tx.init` internally. If you have already initialized the
> `tx` object, you do not have to supply these options.
>
> ```javascript
> const txExpress = new TxExpress({
>   // TxExpress options
>   daemon: true,
>   ttl: 2 * 60,
>
>   // tx options
>   token: '...',
>   filterTags: 'mytags',
> });
>
> // is equivalent to
>
> const { tx } from '@transifex/native';
> tx.init({ token: '...', filterTags: 'mytags' })
> const txExpress = new TxExpress({ daemon: true, ttl: 2 * 60 });
> ```

Finally, fetch available languages and translations and start the server:

```javascript
txExpress.fetch().then(() => {
  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });
});
```

### `txExpress.middleware()` middleware

```javascript
app.use(txExpress.middleware());
```

The middleware will make sure that you have a `req.t` function to translate the
argument to the user's selected language.

```javascript
app.get('/', (req, res) => {
  res.send(req.t('Hello world!'));
});
```

The `t`-function has the same interface as `@transifex/native`'s `t`-function.
So, you can pass all extra arguments, like this:

```javascript
app.get('/', (req, res) => {
  res.send(req.t('Hello world!', { _context: 'foo', _tags: 'bar' }));
});
```

The middleware will also make sure that any templates that are rendered by
Express will have a `t`-function and a `tx` object in their context. The
`t`-function will take care of translation (in the same way as `req.t` does)
and the `tx` object holds a list of available languages and the currently
selected language code (`tx.languages` and `tx.currentLocale` respectively).
Using this, you can do:

```javascript
// index.js
app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index.pug');
});
```


```pug
// views/index.pug
html
  body
    form(method='POST' action='/i18n')
      select(name='locale')
        each locale in tx.languages
          option(
            value=locale.code
            selected=locale.code === tx.currentLocale
          )= locale.name
      input(type='submit' value="Change language")
    p= t('Hello World!')
```

This will render a language-select dropdown (with the list of languages
dynamically fetched by Transifex Native) and a translated string.

This (having `t` and `tx` available in the template's context) works regardless
of which template engine is being used.

### Escaping strings

Normally, interpolating strings in HTML that is to be rendered by a browser can
make your application vulnerable to XSS attacks. For this purpose, the
`t`-function in the express integration (both `req.t` and the `t`-function that
is available to the template's context) return the escaped version of the
rendered string. If you are confident that your string is safe to use inside
HTML or that your template engine takes care of escaping for you, then you must
use `ut` (available both as `req.ut` and as the `ut` function in your
templates). Also, be careful of double escaping:

```javascript
// index.js

app.get('/', (req, res) => {
  // This will send 'hello &lt;world&gt;' and it will appear as 'hello <world>'
  // in the browser
  res.send(req.t('hello <world>'));

  // This will send 'hello <world>' and it is dangerous to show in the browser
  res.send(req.ut('hello <world>'));
})
```

```pug
// views/index.pug

// These will send 'hello &amp;lt;world&amp;gt;' and they will appear as
// 'hello &lt;world&gt;' in the browser
p #{t('hello <world>')}
p= t('hello <world>')

// These will send 'hello &lt;world&gt;' and they will appear as
// 'hello <world>' in the browser
p #{ut('hello <world>')}
p= ut('hello <world>')

// These will send 'hello &lt;world&gt;' and they will appear as
// 'hello <world>' in the browser
p !{t('hello <world>')}
p!= t('hello <world>')

// These will send 'hello <world>' and they are dangerous to show in the
// browser
p !{ut('hello <world>')}
p!= ut('hello <world>')
```

### `txExpress.setLocale()` handler

```javascript
app.post('/i18n', txExpress.setLocale());
```

The `txExpress.setLocale()` endpoint handler (mapped to `/i18n` in the example)
is used by the user to change their selected language. The form to make this
happen could look like this:

```html
<form method="POST" action="/i18n">
  <input type="hidden" name="next" value="/current_url" />
  <select name="locale">
    <option value="en">English</option>
    <option value="el">Greek</option>
    <option value="fr">French</option>
  </select>
  <input type="submit" value="change language" />
</form>
```

The value of `next` will determine where the user will be redirected to after
the form is submitted. If `next` is missing, then the user will be redirected
to the value of `req.headers.referer` which is the page where the form
originated from.

If you make an AJAX POST request with a JSON Content-Type to this endpoint with
a `locale` field, the server will respond with a `{"status": "success"}` reply,
after having changed the user's selected language (it will be up to you to
reload the page if you want to).

## Modes

The user's selected language can be saved and retrieved with a number of
available modes:

### Cookie (default)

This saves the selected language on a cookie named after the value of 'options.name'.

```javascript
const { TxExpress, CookieMode } = require('@transifex/express');
const txExpress = new TxExpress({
  mode: CookieMode({ name: 'my-tx-cookie' }),
});
```

It must be used alongside `cookie-parser`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { TxExpress, CookieMode } = require('@transifex/express');
const txExpress = new TxExpress({
  token: '...',
  mode: CookieMode({ name: 'my-tx-cookie' }),
});

app.use(txExpress.middleware());
app.post('/i18n', txExpress.setLocale());
app.get('/', (req, res) => { res.send(req.t('Hello world!')); });
```

Also accepts the `cookieOptions` option which will be forwarded to `req.cookie()`.

### Signed cookie

This saves the selected language on a signed cookie named after the value of
'options.name'.

```javascript
const { TxExpress, SignedCookieMode } = require('@transifex/express');
const txExpress = new TxExpress({
  mode: SignedCookieMode({ name: 'my-tx-cookie' }),
});
```

It must be used alongside `cookie-parser` which needs to be supplied with a secret:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');
app.use(cookieParser('mysecret'));

const { TxExpress, SignedCookieMode } = require('@transifex/express');
const txExpress = new TxExpress({
  token: '...',
  mode: SignedCookieMode({ name: 'my-tx-cookie' }),
});

app.use(txExpress.middleware());
app.post('/i18n', txExpress.setLocale());
app.get('/', (req, res) => { res.send(req.t('Hello world!')); });
```

Also accepts the `cookieOptions` option which will be forwarded to `req.cookie()`.

### Session

This saves the selected language on a session variable named after the value of
'options.name'.

```javascript
const { TxExpress, SessionMode } = require('@transifex/express');
const txExpress = new TxExpress({
  mode: SessionMode({ name: 'my-tx-cookie' }),
});
```

It must be used alongside `express-session` or `cookie-session`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const session = require('express-session');
// or
const cookieSession = require('cookie-session');

app.use(session({ secret: 'mysecret', ... }));
// or
app.use(cookieSession({ keys: ['mysecret'], ... }));

const { TxExpress, SessionMode } = require('@transifex/express');

const txExpress = new TxExpress({
  token: '...',
  mode: SessionMode({ name: 'my-tx-cookie' }),
});

app.use(txExpress.middleware());
app.post('/i18n', txExpress.setLocale());
app.get('/', (req, res) => { res.send(req.t('Hello world!')); });
```

### Custom modes

The values for the `mode` options are objects that implement the
`setLocale(req, res, locale)` and `getLocale(req, res)` functions. You can
easily implement your own. A sample implementation could look like this:

```javascript
const myMode = {
  userLocales: {}, // User ID to selected locale map
  setLocale(req, res, locale) {
    this.userLocales[req.cookies.userId] = locale;
  },
  getLocale(req, res) {
    return this.userLocales[req.cookies.userId];
  },
};

const txExpress = new TxExpress({ mode: myMode });
```

## Extracting strings with `txjs-cli`

The `txjs-cli` program from the `@transifex/cli` package will manage to extract
invocations of the `req.t` function in your source code, as well as invocations
of the `t` function in '.pug' and '.ejs' templates.

```shell
➜  npm install @transifex/cli

➜  npx txjs-cli push views -v

    Parsing all files to detect translatable content...
    ✓ Processed 2 file(s) and found 2 translatable phrases.
    ✓ Content detected in 2 file(s).
    /views/index.ejs
      └─ This string originated from a EJS file
        └─ occurrences: ["/views/index.ejs"]
    /views/index.pug
      └─ This string originated from a PUG file
        └─ occurrences: ["/views/index.pug"]

    Uploading content to Transifex... Success
    ✓ Successfully pushed strings to Transifex:
      Created strings: 2
```

It is easy to enhance support for express template engines in `txjs-cli`,
especially if the template engine in question works by converting a template to
javascript code that can be then fed to the normal extraction process. In fact,
this in the only piece of code that was needed in order to extend support to
.pug and .ejs templates:

```javascript
// transifex-javascript/packages/cli/src/api/extract.js

function extractPhrases(file, relativeFile, options = {}) {

  // ...

  let source = fs.readFileSync(file, 'utf8');

  if (path.extname(file) === '.pug') {
    source = pug.compileClient(source);
  } else if (path.extname(file) === '.ejs') {
    const template = new ejs.Template(source);
    template.generateSource();
    source = template.source;
  }

  // ...
}
```

So, if your template engine of choice is not supported by `txjs-cli` yet,
please consider contributing a pull request 😉.

## API

### TxExpress

```javascript
new TxExpress({

  // How to save the selected language. Must implement the `setLocale(req, res,
  // locale)` and `getLocale(req, res)` methods. Builtin modes: `CookieMode`,
  // `SignedCookieMode`, `SessionMode`.
  mode: Object,

  // Whether to fall back to the request's 'Accept-Language' header (set by the
  // browser) if the selected language isn't set, default: true
  fallBackToAcceptLanguage: Boolean

  // The locale to fall back to if both the mode and the 'Accept-Language'
  // header fail to produce a result, default: 'en'
  sourceLocale: String,

  // If the server should periodically refetch translations from Transifex,
  // default: true
  daemon: Boolean,

  // If daemon is true, how often to refetch translations in seconds, default:
  // 10 minutes
  ttl: Integer,

  // How to display log messages; a straightforward option would be
  // `console.log`, default: noop
  logging: Function
})
```

### CookieMode

```javascript
CookieMode({
  // The name of the cookie to be used
  name: String,

  // Extra options passed to the `req.cookie()` function
  cookieOptions: Object,
});
```

### SignedCookieMode

```javascript
SignedCookieMode({
  // The name of the cookie to be used
  name: String,

  // Extra options passed to the `req.cookie()` function; the `signed: true`
  // option will always be set
  cookieOptions: Object,
});
```

### SessionMode

```javascript
SessionMode({
  // The name of the session field to be used
  name: String,
});
```
