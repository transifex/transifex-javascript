# Transifex API JavaScript SDK

![example workflow](https://github.com/transifex/transifex-javascript/actions/workflows/npm-publish.yml/badge.svg)
[![npm version](https://img.shields.io/npm/v/@transifex/api.svg)](https://www.npmjs.com/package/@transifex/api)
[![documentation](https://img.shields.io/badge/docs-transifex.com-blue)](https://developers.transifex.com/reference/api-javascript-sdk)


A javascript SDK for the [Transifex API (v3)](https://developers.transifex.com/reference)

## Intro

This SDK is based on the
[`@transifex/jsonapi`](https://github.com/transifex/transifex-javascript/tree/master/packages/jsonapi)
SDK library. Most of the functionality is implemented there. If you want to get
a better understanding of the capabilities of this SDK, we suggest reading
`@transifex/jsonapi`'s documentation.

## Setting up

```javascript
import { transifexApi } from '@transifex/api';

transifexApi.setup({ auth: "..." });
```

The `auth` argument should be an API token. You can generate one at
https://www.transifex.com/user/settings/api/.

## Finding things

To get a list of the organizations your user account has access to, run:

```javascript
const organizations = transifexApi.Organization.list();
await organizations.fetch();
console.log(organizations.data);
```

If you have access to many organizations and the first response comes
paginated, you can get a list of all organizations with:

```javascript
for await (const organization of transifexApi.Organization.all()) {
  console.log({ organization });
}
```

It is highly unlikely that you will have access to so many organizations for
the initial response to be paginated but the `list` and `all` methods are
common to all Transifex API resource types so you might as well get used to
them. If the list fits into one response, using `all` instead of `list` doesn't
have any penalties.

If you want to find a specific organization, you can use the 'slug' filter:

```javascript
const organizations = transifexApi.Organization.filter({ slug: 'my_org' });
await organizations.fetch();
const organization = organizations.data[0];
// or
const organization = await transifexApi.Organization.get({ slug: 'my_org' });
```

_(`get` does the same thing as `filter(...)[0]` but raises an exception if the
number of results is not 1.)_

Alternatively (if for example you don't know the slug but the name of the
organization), you can search against all of them:

```javascript
let organization;
for await (const o of transifexApi.Organization.all()) {
  if (o.get('name') === 'My Org') {
    organization = o;
    break;
  }
}
```

After you get an `Organization` instance, you can access its attributes:

```javascript
console.log(organization.get('name'));
// <<< 'My organization'
```

To get a list of projects, do:

```javascript
const projects = transifexApi.Project.filter({ organization });
await projects.fetch();
```

However, if you look at how a project is represented in the
[API docs](https://developers.transifex.com/reference/get_projects-project-id),
Organization objects have a `projects` relationship with a `related` link, so
you can achieve the same thing with:

```javascript
const projects = await organization.fetch('projects');
await projects.fetch();
```

If you look into the
[API docs](https://developers.transifex.com/reference/get_projects),
you can see that a `slug` filter is also supported, so to find a specific
project, you can do:

```javascript
const projects = await organization.fetch('projects');
const project = await projects.get({ slug: 'my_project' });
```

Projects also have a `languages` relationship. This means that you can access a
project's target languages with:

```javascript
const languages = await project.fetch('languages');
await languages.fetch();
```

## Changing attributes

Let's use what we've learned so far alongside the API documentation to find a
"untranslated string _slot_" (the `/resource_translations` endpoint returns
items for strings that haven't been translated yet, setting their `strings`
field will post a translation):

```javascript
const language = await transifexApi.Language.get({ code: 'el' });
const resources = await project.fetch('resources');
const resource = await resources.get({ slug: 'my_resource' });
const translations = transifexApi.ResourceTranslation
  .filter({ resource, language })
  .include('resource_string');
await translations.fetch();
const translation = translations.data[0];
```

_Appending a `.include` to a filter will pre-fetch a relationship. In the case
of ResourceTranslation, this will also fetch the source string information for
the "translation slot". Again, you should consult the API documentation to see
if including relationships is supported for a given API resource type_

In order to save a translation to the server, we use `.save`:

```javascript
// We don't have to fetch the resource string because it has been included
const source_string = translation.get('resource_string').get('strings').other;

translation.set('strings', { 'other': source_string + ' in greeeek!!!' });
await translation.save(['strings']);
```

We have to specify which fields we will be sending to the API with `save`'s
argument.

Because this is a common use-case (setting attributes and immediately saving
them on the server), there is a shortcut:

```javascript
await translation.save({ strings: { other: source_string + ' in greeek!!!' } });
```

### Changing relationships

Lets use projects, teams and project languages as examples:

```javascript
const project = await transifexApi.Project.get({ organization: ..., slug: '...' });
const team_1 = await project.fetch('team');
const team_2 = await transifexApi.Team.get({ slug: '...' });
```

If we want to change the project's team from `team_1` to `team_2`, we have 2
options:

```javascript
project.set('team', team_2);
await project.save(['team']);

// Or

await project.save({ team: team_2 });
```

This is similar to how we change attributes. The other option is:

```javascript
await project.change('team', team_2);
```

This will send a PATCH request to
[`/projects/XXX/relationships/team`](https://developers.transifex.com/reference/patch_projects-project-id-relationships-team)
to perform the change. Again, you should consult the API documentation to see
which relationships can be changed and with which methods (in this case -
changing a project's team - both methods are available).

The `project -> team` is a "singular relationship" (singular relationships are
either one-to-one or foreign-key relationships). To change a "plural
relationship", like a project's target languages, you can use the `reset`,
`add` and `remove` methods:

```javascript
const languageDict = {};
for await (const language of transifexApi.Language.all()) {
  languageDict[language.get('code')] = language;
}
const [language_a, language_b, language_c] = [languageDict.a, languageDict.b, languageDict.c];

// This will completely replace the project's target languages
// The project's languages after this will be: ['a', 'b']
await project.reset('languages', [language_a, language_b]);

// This will append the supplied languages to the project's target languages
// The project's languages after this will be: ['a', 'b', 'c']
await project.add('languages', [language_c]);

// This will remove the supplied languages from the project's target languages
// The project's languages after this will be: ['a', 'c']
await project.remove('languages', [language_b]);
```

The HTTP methods used for `reset`, `add` and `remove` are `PATCH`, `POST` and
`DELETE` respectively. As always, you should consult the API documentation to
see if the relationship in question is editable and which methods are
supported.

## Creating and deleting things

The following examples should be self-explanatory.

To create something:

```javascript
const organizations = transifexApi.Organization.list();
await organizations.fetch();
const organization = organizations.data[0];

const languages = transifexApi.Organization.list();
await languages.fetch();
const language = languages.data[0];

const project = await transifexApi.Project.create({
  name: 'New Project',
  slug: 'new_project',
  private: true,
  organization,
  source_language,
});
```

You can see which fields are supported in the API documentation. The
`organization` and `source_language` arguments are interpreted as relationships.

To delete something:

```javascript
await project.delete();
```

## File uploads and downloads

There is code in `@transifex/api` that automates several {json:api}
interactions behind the scenes in order to help with file uploads and downloads.

In order to upload a source file to a resource, you can do:

```
const content = JSON.stringify({ key: 'A value' });
await transifexApi.ResourceStringsAsyncUpload.upload({
  resource,
  content,
});
```

In order to upload a translation file to a resource, you can do:

```
const content = JSON.stringify({ key: 'A value in French' });
const language = await transifexApi.Language.get({ code: 'fr' });
await transifexApi.ResourceTranslationsAsyncUpload.upload({
  resource,
  language,
  content,
});
```

To upload binary files, convert file content to `base64` encoding:

```
await transifexApi.ResourceTranslationsAsyncUpload.upload({
  resource,
  language,
  content, // base64 encoded string
  content_encoding: 'base64',
});
```

In order to download a translated language file, you can do:

```
const language = await transifexApi.Language.get({ code: 'fr' });
const url = await transifexApi.ResourceTranslationsAsyncDownload.download({
  resource,
  language,
});
const response = await axios.get(url);
console.log(response.data);
```

As always, in order to see how file uploads and downloads work in the Transifex API, you should check out the API documentation.