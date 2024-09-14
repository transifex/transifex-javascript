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
  <a href="https://www.npmjs.com/package/@wordsmith/cli">
    <img src="https://img.shields.io/npm/v/@wordsmith/cli.svg">
  </a>
  <a href="https://developers.wordsmith.is/docs/native">
    <img src="https://img.shields.io/badge/docs-wordsmith.is-blue">
  </a>
</p>

# Wordsmith Native SDK: JavaScript i18n CLI tool

A command line tool that parses `.js`, `.ts`, `.jsx`, `.tsx` and `.html` source files, extracts phrases marked for localization by [Wordsmith Native](https://www.wordsmith.is/native/) and pushes them to [Wordsmith](https:/www.wordsmith.is) for translation.

Related packages:
* [@wordsmith/native](https://www.npmjs.com/package/@wordsmith/native)
* [@wordsmith/react](https://www.npmjs.com/package/@wordsmith/react)

Learn more about Wordsmith Native in the [Wordsmith Developer Hub](https://developers.wordsmith.is/docs/native).

![cli](https://raw.githubusercontent.com/wordsmith/wordsmith-javascript/master/media/cli.gif)

# Upgrade to v2

If you are upgrading from the `1.x.x` version, please read this [migration guide](https://github.com/Wordsmith-LLL/wordsmith-javascript/blob/HEAD/UPGRADE_TO_V2.md), as there are breaking changes in place.

# Usage

## Global installation

```sh-session
$ npm install -g @wordsmith/cli

$ wsjs-cli COMMAND
running command...

$ wsjs-cli --help [COMMAND]
USAGE
  $ wsjs-cli COMMAND
...
```

## Local installation in existing codebase

Install to local repo using `npm`.

```sh-session
$ npm install @wordsmith/cli --save

$ ./node_modules/.bin/wsjs-cli COMMAND
running command...
```

Add it as a script command in `package.json`.

```json
  ...
  "scripts": {
    "push": "wsjs-cli push src/",
    ...
  },
```

Push content using `npm`.

```sh-session
$ npm run push
```

# Commands
* [`wsjs-cli help [COMMAND]`](#wsjs-cli-help-command)
* [`wsjs-cli push [PATTERN]`](#wsjs-cli-push-pattern)
* [`wsjs-cli pull [PATTERN]`](#wsjs-cli-pull-pattern)
* [`wsjs-cli invalidate`](#wsjs-cli-invalidate)

## `wsjs-cli help [COMMAND]`

Display help for wsjs-cli

```
USAGE
  $ wsjs-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

## `wsjs-cli push [PATTERN]`

detect and push source content to Wordsmith

```
USAGE
  $ wsjs-cli push [PATTERN] [--dry-run] [--fake] [-v] [--purge] [--no-wait] [--token <value>] [--secret <value>] [--append-tags <value>] [--with-tags-only <value>] [--without-tags-only <value>]
    [--cds-host <value>] [--do-not-keep-translations] [--override-tags] [--override-occurrences] [--parser auto|i18next|wsnativejson] [--key-generator source|hash]

ARGUMENTS
  PATTERN  [default: **/*.{js,jsx,ts,tsx,html,vue,pug,ejs}] file pattern to scan for strings

FLAGS
  -v, --verbose                verbose output
  --append-tags=<value>        append tags to strings
  --cds-host=<value>           CDS host URL
  --do-not-keep-translations   remove translations when source strings change
  --dry-run                    dry run, do not apply changes in Wordsmith
  --fake                       do not push content to remote server
  --key-generator=<option>     [default: source] use hashed or source based keys
                               <options: source|hash>
  --no-wait                    disable polling for upload results
  --override-occurrences       override occurrences when pushing content
  --override-tags              override tags when pushing content
  --parser=<option>            [default: auto] file parser to use
                               <options: auto|i18next|wsnativejson>
  --purge                      purge content on Wordsmith
  --secret=<value>             native project secret
  --token=<value>              native project public token
  --with-tags-only=<value>     push strings with specific tags
  --without-tags-only=<value>  push strings without specific tags

DESCRIPTION
  Detect and push source content to Wordsmith
  Parse .js, .ts, .jsx, .tsx and .html files and detect phrases marked for
  translation by Wordsmith Native toolkit for Javascript and
  upload them to Wordsmith for translation.

  To push content some environment variables must be set:
  TRANSIFEX_TOKEN=<Wordsmith Native Project Token>
  TRANSIFEX_SECRET=<Wordsmith Native Project Secret>
  (optional) TRANSIFEX_CDS_HOST=<CDS HOST>

  or passed as --token=<TOKEN> --secret=<SECRET> parameters

  Default CDS Host is https://cds.svc.wordsmith.net

  Examples:
  wsjs-cli push -v
  wsjs-cli push src/
  wsjs-cli push /home/repo/src
  wsjs-cli push "*.js"
  wsjs-cli push --dry-run
  wsjs-cli push --fake -v
  wsjs-cli push --no-wait
  wsjs-cli push --key-generator=hash
  wsjs-cli push --append-tags="master,release:2.5"
  wsjs-cli push --with-tags-only="home,error"
  wsjs-cli push --without-tags-only="custom"
  wsjs-cli push --token=mytoken --secret=mysecret
  wsjs-cli push en.json --parser=i18next
  wsjs-cli push en.json --parser=wsnativejson
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret wsjs-cli push
```

## `wsjs-cli pull [PATTERN]`

Pull content from Wordsmith for offline caching

```
USAGE
  $ wsjs-cli pull [--token <value>] [--secret <value>] [-f <value>] [-l <value>] [--pretty] [--filter-tags <value>] [--filter-status reviewed|proofread|finalized] [--cds-host <value>]

FLAGS
  -f, --folder=<value>      output as files to folder
  -l, --locale=<value>      pull specific language locale code
  --cds-host=<value>        CDS host URL
  --filter-status=<option>  filter over translation status
                            <options: reviewed|proofread|finalized>
  --filter-tags=<value>     filter over specific tags
  --pretty                  beautify JSON output
  --secret=<value>          native project secret
  --token=<value>           native project public token

DESCRIPTION
  Pull content from Wordsmith for offline caching
  Get content as JSON files, to be used by mobile Javascript SDKs for
  offline support or warming up the cache with initial translations.

  By default, JSON files are printed in the console,
  unless the "-f foldername" parameter is provided. In that case
  the JSON files will be downloaded to that folder with the <locale>.json format.

  To pull content some environment variables must be set:
  TRANSIFEX_TOKEN=<Wordsmith Native Project Token>
  TRANSIFEX_SECRET=<Wordsmith Native Project Secret>
  (optional) TRANSIFEX_CDS_HOST=<CDS HOST>

  or passed as --token=<TOKEN> --secret=<SECRET> parameters

  Default CDS Host is https://cds.svc.wordsmith.net

  Examples:
  wsjs-cli pull
  wsjs-cli pull --pretty
  wsjs-cli pull -f languages/
  wsjs-cli pull --locale=fr -f .
  wsjs-cli pull --filter-tags="foo,bar"
  wsjs-cli pull --filter-status="reviewed"
  wsjs-cli pull --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret wsjs-cli pull
```

## `wsjs-cli invalidate`

invalidate and refresh CDS cache

```
USAGE
  $ wsjs-cli invalidate [--purge] [--token <value>] [--secret <value>] [--cds-host <value>]

FLAGS
  --cds-host=<value>  CDS host URL
  --purge             force delete CDS cached content
  --secret=<value>    native project secret
  --token=<value>     native project public token

DESCRIPTION
  Invalidate and refresh CDS cache
  Content for delivery is cached in CDS and refreshed automatically every hour.
  This command triggers a refresh of cached content on the fly.

  By default, invalidation does not remove existing cached content,
  but starts the process of updating with latest translations from Wordsmith.

  Passing the --purge option, cached content will be forced to be deleted,
  however use that with caution, as it may introduce downtime of
  translation delivery to the apps until fresh content is cached in the CDS.

  To invalidate translations some environment variables must be set:
  TRANSIFEX_TOKEN=<Wordsmith Native Project Token>
  TRANSIFEX_SECRET=<Wordsmith Native Project Secret>
  (optional) TRANSIFEX_CDS_HOST=<CDS HOST>

  or passed as --token=<TOKEN> --secret=<SECRET> parameters

  Default CDS Host is https://cds.svc.wordsmith.net

  Examples:
  wsjs-cli invalidate
  wsjs-cli invalidate --purge
  wsjs-cli invalidate --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret wsjs-cli invalidate
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/Wordsmith-LLL/wordsmith-javascript/blob/HEAD/LICENSE) file.
