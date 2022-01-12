# Transifex Native for Vue

Vue2 component for localizing Vue application using
[Transifex Native](https://www.transifex.com/native/).

Related packages:
- [@transifex/native](https://www.npmjs.com/package/@transifex/native)
- [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

# Upgrade to v2

If you are upgrading from the `1.x.x` version, please read this [migration guide](https://github.com/transifex/transifex-javascript/blob/HEAD/UPGRADE_TO_V2.md), as there are breaking changes in place.


# Install

Install the library and its dependencies using:

```sh
npm install @transifex/native @transifex/vue2 --save
```

# Usage

## Initiate the plugin in a Vue App

```javascript
import Vue from 'vue';
import App from './App.vue';
import { tx } from '@transifex/native';
import { TransifexVue } from '@transifex/vue2';

tx.init({
  token: '<token>',
});

Vue.use(TransifexVue);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
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
import { LanguagePicker } from '@transifex/vue2';
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

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
