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
  <a href="https://www.npmjs.com/package/@transifex/cli">
    <img src="https://img.shields.io/npm/v/@transifex/cli.svg">
  </a>
  <a href="https://developers.transifex.com/docs/native">
    <img src="https://img.shields.io/badge/docs-transifex.com-blue">
  </a>
</p>

# Transifex Native SDK: JavaScript i18n CLI tool

A command line tool that parses `.js`, `.ts`, `.jsx`, `.tsx` and `.html` source files, extracts phrases marked for localization by [Transifex Native](https://www.transifex.com/native/) and pushes them to [Transifex](https:/www.transifex.com) for translation.

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)
* [@transifex/react](https://www.npmjs.com/package/@transifex/react)

Learn more about Transifex Native in the [Transifex Developer Hub](https://developers.transifex.com/docs/native).

![cli](https://raw.githubusercontent.com/transifex/transifex-javascript/master/media/cli.gif)

# Upgrade to v2

If you are upgrading from the `1.x.x` version, please read this [migration guide](https://github.com/transifex/transifex-javascript/blob/HEAD/UPGRADE_TO_V2.md), as there are breaking changes in place.

# Usage

## Global installation

```sh-session
$ npm install -g @transifex/cli

$ txjs-cli COMMAND
running command...

$ txjs-cli --help [COMMAND]
USAGE
  $ txjs-cli COMMAND
...
```

## Local installation in existing codebase

Install to local repo using `npm`.

```sh-session
$ npm install @transifex/cli --save

$ ./node_modules/.bin/txjs-cli COMMAND
running command...
```

Add it as a script command in `package.json`.

```json
  ...
  "scripts": {
    "push": "txjs-cli push src/",
    ...
  },
```

Push content using `npm`.

```sh-session
$ npm run push
```

# Commands
* [`txjs-cli help [COMMAND]`](#txjs-cli-help-command)
* [`txjs-cli push [PATTERN]`](#txjs-cli-push-pattern)
* [`txjs-cli pull [PATTERN]`](#txjs-cli-pull-pattern)
* [`txjs-cli invalidate`](#txjs-cli-invalidate)

## `txjs-cli help [COMMAND]`

Display help for txjs-cli

```
USAGE
  $ txjs-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

## `txjs-cli push [PATTERN]`

detect and push source content to Transifex

```
USAGE
  $ txjs-cli push [PATTERN] [--dry-run] [--fake] [-v] [--purge] [--no-wait] [--token <value>] [--secret <value>] [--append-tags <value>] [--with-tags-only <value>] [--without-tags-only <value>]
    [--cds-host <value>] [--do-not-keep-translations] [--override-tags] [--override-occurrences] [--parser auto|i18next|txnativejson] [--key-generator source|hash]

ARGUMENTS
  PATTERN  [default: **/*.{js,jsx,ts,tsx,html,vue,pug,ejs}] file pattern to scan for strings

FLAGS
  -v, --verbose                verbose output
  --append-tags=<value>        append tags to strings
  --cds-host=<value>           CDS host URL
  --do-not-keep-translations   remove translations when source strings change
  --dry-run                    dry run, do not apply changes in Transifex
  --fake                       do not push content to remote server
  --key-generator=<option>     [default: source] use hashed or source based keys
                               <options: source|hash>
  --no-wait                    disable polling for upload results
  --override-occurrences       override occurrences when pushing content
  --override-tags              override tags when pushing content
  --parser=<option>            [default: auto] file parser to use
                               <options: auto|i18next|txnativejson>
  --purge                      purge content on Transifex
  --secret=<value>             native project secret
  --token=<value>              native project public token
  --with-tags-only=<value>     push strings with specific tags
  --without-tags-only=<value>  push strings without specific tags

DESCRIPTION
  Detect and push source content to Transifex
  Parse .js, .ts, .jsx, .tsx and .html files and detect phrases marked for
  translation by Transifex Native toolkit for Javascript and
  upload them to Transifex for translation.

  To push content some environment variables must be set:
  TRANSIFEX_TOKEN=<Transifex Native Project Token>
  TRANSIFEX_SECRET=<Transifex Native Project Secret>
  (optional) TRANSIFEX_CDS_HOST=<CDS HOST>

  or passed as --token=<TOKEN> --secret=<SECRET> parameters

  Default CDS Host is https://cds.svc.transifex.net

  Examples:
  txjs-cli push -v
  txjs-cli push src/
  txjs-cli push /home/repo/src
  txjs-cli push "*.js"
  txjs-cli push --dry-run
  txjs-cli push --fake -v
  txjs-cli push --no-wait
  txjs-cli push --key-generator=hash
  txjs-cli push --append-tags="master,release:2.5"
  txjs-cli push --with-tags-only="home,error"
  txjs-cli push --without-tags-only="custom"
  txjs-cli push --token=mytoken --secret=mysecret
  txjs-cli push en.json --parser=i18next
  txjs-cli push en.json --parser=txnativejson
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret txjs-cli push
```

## `txjs-cli pull [PATTERN]`

Pull content from Transifex for offline caching

```
USAGE
  $ txjs-cli pull [--token <value>] [--secret <value>] [-f <value>] [-l <value>] [--pretty] [--filter-tags <value>] [--filter-status reviewed|proofread|finalized] [--cds-host <value>]

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
  Pull content from Transifex for offline caching
  Get content as JSON files, to be used by mobile Javascript SDKs for
  offline support or warming up the cache with initial translations.

  By default, JSON files are printed in the console,
  unless the "-f foldername" parameter is provided. In that case
  the JSON files will be downloaded to that folder with the <locale>.json format.

  To pull content some environment variables must be set:
  TRANSIFEX_TOKEN=<Transifex Native Project Token>
  TRANSIFEX_SECRET=<Transifex Native Project Secret>
  (optional) TRANSIFEX_CDS_HOST=<CDS HOST>

  or passed as --token=<TOKEN> --secret=<SECRET> parameters

  Default CDS Host is https://cds.svc.transifex.net

  Examples:
  txjs-cli pull
  txjs-cli pull --pretty
  txjs-cli pull -f languages/
  txjs-cli pull --locale=fr -f .
  txjs-cli pull --filter-tags="foo,bar"
  txjs-cli pull --filter-status="reviewed"
  txjs-cli pull --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret txjs-cli pull
```

## `txjs-cli invalidate`

invalidate and refresh CDS cache

```
USAGE
  $ txjs-cli invalidate [--purge] [--token <value>] [--secret <value>] [--cds-host <value>]

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
  but starts the process of updating with latest translations from Transifex.

  Passing the --purge option, cached content will be forced to be deleted,
  however use that with caution, as it may introduce downtime of
  translation delivery to the apps until fresh content is cached in the CDS.

  To invalidate translations some environment variables must be set:
  TRANSIFEX_TOKEN=<Transifex Native Project Token>
  TRANSIFEX_SECRET=<Transifex Native Project Secret>
  (optional) TRANSIFEX_CDS_HOST=<CDS HOST>

  or passed as --token=<TOKEN> --secret=<SECRET> parameters

  Default CDS Host is https://cds.svc.transifex.net

  Examples:
  txjs-cli invalidate
  txjs-cli invalidate --purge
  txjs-cli invalidate --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret txjs-cli invalidate
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
