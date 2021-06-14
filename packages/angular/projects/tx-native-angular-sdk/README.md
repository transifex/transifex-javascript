# Transifex Native for Angular

Angular library for localizing Angular application using
[Transifex Native](https://www.transifex.com/native/).

Related packages:
- [@transifex/native](https://www.npmjs.com/package/@transifex/native)
- [@transifex/cli](https://www.npmjs.com/package/@transifex/cli)

## Table of Contents
* [Installation](#installation)
* [Usage](#usage)
  * [Initialization](#initialization)
  * [T Component](#t-component)
  * [UT Component](#ut-component)
  * [TranslationService service](#translationservice-service)
  * [@T Decorator](#@t-decorator)
  * [Language Picker Component](#language-picker-component)
* [License](#license)


## Installation

Install the library and its dependencies using:

```sh
npm install @transifex/native @transifex/angular --save
```

## Usage

### Initialization

In order to use the TX Native object globally, it is necessary to initialize
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

    // TX Native module declaration
    TxNativeModule.forRoot(),
  ],
  providers: [,
  ],
  bootstrap: [AppComponent]
})
```

- Application Boostrap

```typescript
import { Component } from '@angular/core';
import { TranslationService } from '@transifex/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translationService: TranslationService) {
    // TX Native library intialization
    translationService.init({
      token: '----- here your TX Native token ------',
    });
  }

  async ngOnInit() {
    await this.translationService.getLanguages();
    await this.translationService.setCurrentLocale('el');
  }
}
```

### `T` Component

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


### `UT` Component

```html
  <p>
    <UT
      str="Copyright {year} by Transifex."
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

### `TranslationService` service

This is the main service exposed from the SDK in order to intialize the TX Native object.

In your bootstrap entry point in the Angular application, you should initialize the SDK, like this:

```typescript
import { Component } from '@angular/core';
import { TranslationService } from '@transifex/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TX Native Angular Demo';

  constructor(private translationService: TranslationService) {
    translationService.init({
      token: '----- here your TX Native token ------',
    });
  }

  async ngOnInit() {
    await this.translationService.getLanguages();
    await this.translationService.setCurrentLocale('el');
  }
}
```
The translation service is a `singleton` instance so the initialization will be shared across the whole application.

Exposes the following methods and properties:

| Method           | Parameters       | Description                                       |
|------------------|------------------|---------------------------------------------------|
| init             | config <sup>1</sup>          | Initializes the TX Native object                  |
| setCurrentLocale | locale           | Set the current locale in the TX Native object    |
| getCurrentLocale | none             | Returns the current locale of the TX Native object|
| getLanguages     | none             | Returns an array of available languages           |
| translate        | translate params <sup>2</sup> | Returns the translation for a string with given translation params |

<sup>(1)</sup> Initialization config

```typescript
export interface ITranslationServiceConfig {
  token: string;
  cdsHost?: string;
  filterTags?: string;
  cache?: () => void;
  missingPolicy?: () => void;
  errorPolicy?: () => void;
  stringRenderer?: () => void;
}
```
- `cache`, `missingPolicy`, `errorPolicy` and `stringRenderer` are set by default by
`@transifex/native` package but you can provide if you wish custom functions
of your own, or use another policy provided by the `@transifex/native` package.

Please check the documentation related to this on`@transifex/native` package [here](https://github.com/transifex/transifex-javascript/tree/master/packages/native).

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

### `@T` Decorator

This is a decorator for using inside classes and components in order to have
properties with the translation and used them in code and templates.

An example of use is the following:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { T, TranslationService } from '@transifex/angular';

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

### Language Picker Component

Renders a `<select>` tag that displays supported languages and switches the
application's selected language on change.
Uses `Translation Service` internally.

The html selector is `tx-language-picker`.

This is an example of use for the language picker component:

```html
<tx-language-picker
  className="placeBottomLeft"
  (localeChanged)="onLocaleChanged($event)"></tx-language-picker>
```

and the event for locale changed inside the component could be:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { T, TranslationService } from '@transifex/angular';

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


# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
