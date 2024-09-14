<p align="center">
  <a href="https://www.wordsmith.is">
    <img src="https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/wordsmith.png" height="60">
  </a>
</p>
<p align="center">
  <i>Wordsmith Native is a full end-to-end, cloud-based localization stack for moderns apps.</i>
</p>
<p align="center">
  <img src="https://github.com/Wordsmith-LLL/wordsmith-javascript/actions/workflows/npm-publish.yml/badge.svg">
  <a href="https://www.npmjs.com/package/@wordsmith/angular">
    <img src="https://img.shields.io/npm/v/@wordsmith/angular.svg">
  </a>
  <a href="https://developers.wordsmith.is/docs/native">
    <img src="https://img.shields.io/badge/docs-wordsmith.is-blue">
  </a>
</p>

# Wordsmith Native SDK: Angular i18n

Angular library for localizing Angular application using
[Wordsmith Native](https://www.wordsmith.is/native/).

Related packages:
- [@wordsmith/native](https://www.npmjs.com/package/@wordsmith/native)
- [@wordsmith/cli](https://www.npmjs.com/package/@wordsmith/cli)

Learn more about Wordsmith Native in the [Wordsmith Developer Hub](https://developers.wordsmith.is/docs/native).

# How it works

**Step1**: Create a Wordsmith Native project in [Wordsmith](https://www.wordsmith.is).

**Step2**: Grab credentials.

**Step3**: Internationalize the code using the SDK.

**Step4**: Push source phrases using the `@wordsmith/cli` tool.

**Step5**: Translate the app using over-the-air updates.

No translation files required.

![native](https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/native.gif)

## Upgrade to v2

If you are upgrading from the `1.x.x` version, please read this [migration guide](https://github.com/Wordsmith-LLL/wordsmith-javascript/blob/HEAD/UPGRADE_TO_V2.md), as there are breaking changes in place.



## Table of Contents
* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage)
  * [Initialization](#initialization)
  * [T Component](#t-component)
  * [UT Component](#ut-component)
  * [TranslationService service](#translationservice-service)
  * [@T Decorator](#@t-decorator)
  * [translate Pipe](#translate-pipe)
  * [Language Picker Component](#language-picker-component)
  * [WS Instance Component](#ws-instance-component)
  * [wsLoadTranslations Directive](#wsloadtranslations-directive)
* [License](#license)


# Requirements

Angular 16 is required. If you are using Angular 14 or 15, please use the `6.x.x` version of
Wordsmith Native related packages. If you are using Angular 12 or 13, please use the `5.x.x` version of
Wordsmith Native related packages. If you are using Angular 11, please use the `1.x.x` version of
Wordsmith Native related packages. Other Angular versions are not officially supported at the moment.

# Installation

Install the library and its dependencies using:

```sh
npm install @wordsmith/native @wordsmith/angular --save
```

# Usage

## Initialization

In order to use the WS Native object globally, it is necessary to initialize
the library in the angular application bootstrap, in two locations:

- NgModule initialization

```typescript
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TermsComponent,
    HomeComponent,
    PrivacyComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,

    // WS Native module declaration
    WsNativeModule.forRoot(),
  ],
  providers: [,
  ],
  bootstrap: [AppComponent]
})
```

- Application Boostrap

```typescript
import { Component } from '@angular/core';
import { TranslationService } from '@wordsmith/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translationService: TranslationService) {
    // WS Native library intialization
    translationService.init({
      token: '----- here your WS Native token ------',
    });
  }

  async ngOnInit() {
    await this.translationService.getLanguages();
    await this.translationService.setCurrentLocale('el');
  }
}
```

## `T` Component

```html
  <p>
    <label>
      <T str="Password" key="label.password"></T>
    </label>
    <input type="password" name="password" />
  </p>

```

Available optional props:

| Prop       | Type    | Description                                 |
|------------|---------|---------------------------------------------|
| context    | String  | String context, affects key generation      |
| key        | String  | Custom string key                           |
| comment    | String  | Developer comment                           |
| charlimit  | Number  | Character limit instruction for translators |
| tags       | String  | Comma separated list of tags                |
| escapeVars | Boolean | If escaping should be applied to ICU variables                |
| sanitize   | Boolean | Safe render of the HTML result after translation takes place   |
| vars       | Object  | ICU variables to render in the string       |

The T component can sanitize the translated result if HTML is involved, using the parameter `sanitize`, ie this would be possible:

```html
<p>
    <T
      str="By proceeding you agree to the {terms_of_services} and {privacy_policy}."
      key="text.agree_message"
      [sanitize]=true
      [vars]="{ terms_of_services: '<a href=\'terms\'>' + terms + '</a>',
        privacy_policy: '<a href=\'privacy\'>' + privacy + '</a>'
      }">
    </T>
  </p>
```

This will render like this in English:

```html
<span>By proceeding you agree to the <a href="terms">terms of service</a> and <a href="privacy">privacy policy</a>.</span>
```

And like this in Greek:

```html
<span>Συνεχίζοντας, αποδέχεστε τους <a href="terms">όροι χρήσης</a> και τους <a href="privacy">πολιτική απορρήτου</a>.</span>
```

The same block without the `sanitize` option would be like this, for Greek:

```html
Συνεχίζοντας, αποδέχεστε τους &lt;a href='terms'&gt;όροι χρήσης&lt;/a&gt; και τους &lt;a href='privacy'&gt;πολιτική απορρήτου&lt;/a&gt;.
```

The main thing to keep in mind is that the `str` property to the T component
must **always** be a valid ICU message format template.

If it is nested into a ```ws-instance``` tag, then the ```T component``` will use the new instance to fetch the translation. Check the [WS Instance Component](#ws-instance-component) section for more information about additional instances.


## `UT` Component

```html
  <p>
    <UT
      str="Copyright {year} by Wordsmith."
      key="text.copyright"
      [inline]=false
      comment="This is the current year"
      [vars]="{ year: '&copy; 2020' }">
    </UT>
  </p>

```

`UT` has the same behaviour as `T`, but renders source string as HTML inside a
`div` tag or a `span` tag if `inline` property is true. By default this property
is set to `false`.

Available optional props:

| Prop       | Type    | Description                                 |
|------------|---------|---------------------------------------------|
| inline     | Boolean | If should wrap the translation with `span` (true) or with `div` (false) |

If it is nested into a ```ws-instance``` tag, then the ```UT component``` will use the new instance to fetch the translation. Check the [WS Instance Component](#ws-instance-component) section for more information about additional instances.

## `TranslationService` service

This is the main service exposed from the SDK in order to intialize the WS Native object.

In your bootstrap entry point in the Angular application, you should initialize the SDK, like this:

```typescript
import { Component } from '@angular/core';
import { TranslationService } from '@wordsmith/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'WS Native Angular Demo';

  constructor(private translationService: TranslationService) {
    translationService.init({
      token: '----- here your WS Native token ------',
    });
  }

  async ngOnInit() {
    await this.translationService.getLanguages();
    await this.translationService.setCurrentLocale('el');
  }
}
```
The translation service is a `singleton` instance so the initialization will be shared across the whole application.

It keeps also a collection of additional WS Native instances which can be added to the default instance for specific purposes.

Each addional instance should have the following configuration:

```ts
IWSInstanceConfiguration {
  token: string;
  alias: string;
  controlled: boolean;
}
```

See the section [WS Instance Component](#ws-instance-component) for more details.

The additional instances can be added and retrieved using exposed methods ```addInstance``` and ```getInstance```.

The translation service also offers the possibility to retrieve translations that match a given list of tags, this way it's possible to fetch groups of translations in batches, at different times or for lazy loading. This can be achieved using the ```fetchTranslations``` method.

Exposes the following methods and properties:

| Method           | Parameters       | Description                                       |
|------------------|------------------|---------------------------------------------------|
| init             | config <sup>1</sup>          | Initializes the WS Native object                  |
| setCurrentLocale | locale           | Set the current locale in the WS Native object    |
| getCurrentLocale | none             | Returns the current locale of the WS Native object|
| getLanguages     | none             | Returns an array of available languages           |
| translate        | translate params <sup>2</sup> | Returns the translation for a string with given translation params |
| localeChanged    | none | Returns an observable for monitoring the locale changed event |
| translationsFetched    | none | Returns an observable for monitoring the fetch translations event |
| addInstance      | IWSInstanceConfiguration | Returns true if the new WS Native instance was added succesfully and false otherwise |
| getInstance      | string | Returns the WS Native instance with the given alias. If the operation is not possible the default one is returned as fallback.  |
| fetchTranslations      | array | Returns a collection of translations that match a given list of tags.  |

<sup>(1)</sup> Initialization config

```typescript
export interface ITranslationServiceConfig {
  token: string;
  cdsHost?: string;
  filterTags?: string;
  filterStatus?: string;
  cache?: () => void;
  missingPolicy?: IPolicy;
  errorPolicy?: IPolicy;
  stringRenderer?: IStringRenderer;
}
```
- `cache`, `missingPolicy`, `errorPolicy` and `stringRenderer` are set by default by
`@wordsmith/native` package but you can provide if you wish custom functions
of your own, or use another policy provided by the `@wordsmith/native` package.

Please check the documentation related to this on`@wordsmith/native` package [here](https://github.com/Wordsmith-LLL/wordsmith-javascript/tree/master/packages/native).

<sup>(2)</sup> Translation params

```typescript
str: string // string to be translated
params: Record<string, unknown> // an object with the params and variables
```

The params should follow the interface:

```typescript
export interface ITranslateParams {
  _context?: string;
  _comment?: string;
  _charlimit?: number;
  _tags?: string;
  _key?: string;
  _escapeVars?: boolean;
  _inline?: boolean;
  sanitize?: boolean;
}
```

## `@T` Decorator

This is a decorator for using inside classes and components in order to have
properties with the translation and used them in code and templates.

An example of use is the following:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { T, TranslationService } from '@wordsmith/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Translations using decorator
  @T('Monday', { _key: 'text.monday' })
  weekday: string;
  @T('terms of service', { _key: 'text.terms_of_service' })
  terms: string;
  @T('privacy policy', { _key: 'text.privacy_policy' })
  privacy: string;

  constructor(
    private translationService: TranslationService,
    private router: Router) {}

  login() {
    this.router.navigateByUrl('home');
  }
}
```

and the use of the properties in the template:

```html
  <p>
    <T
      str="By proceeding you agree to the {terms_of_services} and {privacy_policy}."
      key="text.agree_message"
      [sanitize]=true
      [vars]="{ terms_of_services: '<a href=\'#/terms\'>' + terms + '</a>',
        privacy_policy: '<a href=\'#/privacy\'>' + privacy + '</a>'
      }"
    ></T>
  </p>
```
An instance configuration can be passed to the decorator in order to use an alternative instance instead of the main WS Native one.

See [WS Instance Component](#ws-instance-component) for more information.

Example of alternative instance:

```ts
const INSTANCE_CONFIG = {
  token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  alias: 'mycmppage',
  controlled: true,
};

@Component({
  selector: 'my-component',
  templateUrl: './my.component.html',
  styleUrls: ['./my.component.scss']
})
export class MyComponent implements OnInit {
  @T('My string', { _key: 'text.my_string' }, INSTANCE_CONFIG)
  myString: string;
```

## `translate` Pipe

You have available a `translate` pipe for inline strings translations, the only limitation that it has is that
you cannot translate strings with embedded HTML.

These examples will work:

```html
  {{ 'Copyright {year} by Wordsmith' | translate:{ _key: 'text.copyright' } }}

  <p [matTooltip]="'A paragraph' | translate">A paragraph</p>
```

this example will not work, as it has HTML embedded:

```html
  {{ 'A string with <b>HTML embedded</b>' | translate }}
```

If it is nested into a ```ws-instance``` tag, then the pipe will use the new instance to fetch the translation. Check the [WS Instance Component](#ws-instance-component) section for more information about additional instances.

## Language Picker Component

Renders a `<select>` tag that displays supported languages and switches the
application's selected language on change.
Uses `Translation Service` internally.

The html selector is `ws-language-picker`.

This is an example of use for the language picker component:

```html
<ws-language-picker
  className="placeBottomLeft"
  (localeChanged)="onLocaleChanged($event)"></ws-language-picker>
```

and the event for locale changed inside the component could be:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { T, TranslationService } from '@wordsmith/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  onLocaleChanged(event) {
    // here we can do any action when locale changes
  }
}
```
Accepts properties:

- `className`: The CSS class that will be applied to the `<select>` tag

Returns:

- `localeChanged`: event for handling the change of locale

You always can implement a language picker of your choice, injecting
the `TranslationService` and using the different methods provided,
such as `getLanguages`.

## WS Instance Component

Creates a new WS Native instance with the given configuration and adds it to the WS Native main instance. All the nested components will use the new instance in order to fetch the translations. This apply to components:

- T/UT
- translate pipe

Uses `Translation Service` internally to add the instance.

The html selector is `ws-instance`.

This is an example of use for the instance component:

```ts
this.instanceConfig = {
      token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      alias: 'homepage',
      controlled: true,
    };
```

```html
<ws-instance
  [token]="instanceConfig?.token"
  [alias]="instanceConfig?.alias"
  [controlled]="instanceConfig?.controlled"
  (instanceReady)="onInstanceReady($event)"
>
  <T str="My brand new string"></T>
</ws-instance>
```

Accepts properties:

- `token`: The token for the new instance.

- `alias`: A string indetifier of the instance, should be unique. If the identifier already exists, the existing instance with the given alias is used, and no new instance is created.

- `controlled`: If the new instance is controlled (locale) by the main WS Native instance.

Returns:

- `instanceReady`: event for handling the readiness of the new instance.

Exposes:

- `instanceIsReady`: observable for listening the readiness of the new instance.

## `wsLoadTranslations` Directive

This directive can be used within any html or angular tag in order to force a group of translations to be fetched, using a list of tags to retrieve the translations that match.

This is an example of use:

```html
  <p class="small-text" [wsLoadTranslations]="'menu'">
    <a href="#/home">
      <UT str="home" key="text.home" inline=true></UT>
    </a>
    <a href="#/terms">
      <UT str="terms of service" key="text.terms_of_service" inline=true></UT>
    </a>
    <a href="#/privacy">
      <UT str="privacy policy" key="text.privacy_policy" inline=true></UT>
    </a>
    <a class="align-right" href="#/login">
      <UT str="logout" key="text.logout" inline=true></UT>
    </a>
  </p>
```

All the translations with the tag ```menu``` will be fetched using the current selected locale and instance, if the translations are already cached, they are not fetched again.

This way we can fetch the translations related with the part of the component's template when the component is first used and not from the beginning when instance is initialized (in the initialization we can use the ```filterTags``` param in order to fetch an initial set of translations and then use the lazy loading and improve the performance).

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/Wordsmith-LLL/wordsmith-javascript/blob/HEAD/LICENSE) file.
