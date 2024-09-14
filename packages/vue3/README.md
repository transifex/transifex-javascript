<p align="center">
  <a href="https://www.wordsmith.com">
    <img src="https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/wordsmith.png" height="60">
  </a>
</p>
<p align="center">
  <i>Wordsmith Native is a full end-to-end, cloud-based localization stack for moderns apps.</i>
</p>
<p align="center">
  <img src="https://github.com/wordsmith/wordsmith-javascript/actions/workflows/npm-publish.yml/badge.svg">
  <a href="https://www.npmjs.com/package/@wordsmith/vue3">
    <img src="https://img.shields.io/npm/v/@wordsmith/vue3.svg">
  </a>
  <a href="https://developers.wordsmith.com/docs/native">
    <img src="https://img.shields.io/badge/docs-wordsmith.com-blue">
  </a>
</p>

# Wordsmith Native SDK: Vue i18n

Vue3 component for localizing Vue application using
[Wordsmith Native](https://www.wordsmith.com/native/).

Related packages:
- [@wordsmith/native](https://www.npmjs.com/package/@wordsmith/native)
- [@wordsmith/cli](https://www.npmjs.com/package/@wordsmith/cli)

Learn more about Wordsmith Native in the [Wordsmith Developer Hub](https://developers.wordsmith.com/docs/native).

# How it works

**Step1**: Create a Wordsmith Native project in [Wordsmith](https://www.wordsmith.com).

**Step2**: Grab credentials.

**Step3**: Internationalize the code using the SDK.

**Step4**: Push source phrases using the `@wordsmith/cli` tool.

**Step5**: Translate the app using over-the-air updates.

No translation files required.

![native](https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/native.gif)

# Upgrade to v2

If you are upgrading from the `1.x.x` version, please read this [migration guide](https://github.com/wordsmith/wordsmith-javascript/blob/HEAD/UPGRADE_TO_V2.md), as there are breaking changes in place.


# Install

Install the library and its dependencies using:

```sh
npm install @wordsmith/native @wordsmith/vue3 --save
```

# Usage

## Initiate the plugin in a Vue App

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { ws } from '@wordsmith/native';
import { WordsmithVue } from '@wordsmith/vue3';

ws.init({
  token: '<token>',
});

const app = createApp(App);

app.use(WordsmithVue);
app.mount('#app');

```


## `T` Component

```javascript
<template>
  <div>
    <T _str="Hello world" />
    <T _str="Hello {username}" :username="user" />
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        user: 'John'
      };
    },
  }
</script>
```

Available optional props:

| Prop       | Type   | Description                                 |
|------------|--------|---------------------------------------------|
| _context   | String | String context, affects key generation      |
| _key       | String | Custom string key                           |
| _comment   | String | Developer comment                           |
| _charlimit | Number | Character limit instruction for translators |
| _tags      | String | Comma separated list of tags                |


## `UT` Component

```javascript
<template>
  <div>
      <UT _str="Hello <b>{username}</b>" :username="user" />
      <p>
        <UT _str="Hello <b>{username}</b>" :username="user" _inline="true" />
      </p>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        user: 'John'
      };
    },
  }
</script>
```

`UT` has the same behaviour as `T`, but renders source string as HTML inside a
`div` tag.

Available optional props: All the options of `T` plus:

| Prop    | Type    | Description                                     |
|---------|---------|-------------------------------------------------|
| _inline | Boolean | Wrap translation in `span` |

## `$t` template function or `this.t` alias for scripts

Makes the current component re-render when a language change is detected and
returns a t-function you can use to translate strings programmatically.

You will most likely prefer to use the `T` or `UT` components over this, unless
for some reason you want to have the translation output in a variable for
manipulation.

```javascript
<template>
  <div>
    {{$t('Hello world').toLowerCase()}}
    {{hellofromscript}}
  </div>
</template>

<script>
  export default {
    name: 'App',
    computed: {
      hellofromscript: function() { return this.t('Hello world').toLowerCase() },
    },
  }
</script>

```

## `LanguagePicker` component

Renders a `<select>` tag that displays supported languages and switches the
application's selected language on change.

```javascript
<template>
  <div>
    <T _str="This is a translatable message" />
    <LanguagePicker />
  </div>
</template>

<script>
import { LanguagePicker } from '@wordsmith/vue3';
  export default {
    name: 'App',
    components: {
      LanguagePicker,
    }
  }
</script>
```

Accepts properties:

- `className`: The CSS class that will be applied to the `<select>` tag.

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/wordsmith/wordsmith-javascript/blob/HEAD/LICENSE) file.
