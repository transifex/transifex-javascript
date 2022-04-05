# Transifex Native CLI

A command line tool that parses `.js`, `.ts`, `.jsx`, `.tsx` and `.html` source files, extracts phrases marked for localization by [Transifex Native](https://www.transifex.com/native/) and pushes them to [Transifex](https:/www.transifex.com) for translation.

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)
* [@transifex/react](https://www.npmjs.com/package/@transifex/react)

Learn more about Transifex Native in the [Transifex Developer Hub](https://developers.transifex.com/docs/native).

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
  $ txjs-cli push [PATTERN]

ARGUMENTS
  PATTERN  [default: **/*.{js,jsx,ts,tsx,vue}] file pattern to scan for strings

OPTIONS
  -v, --verbose                          verbose output
  --append-tags=append-tags              append tags to strings
  --cds-host=cds-host                    CDS host URL
  --dry-run                              dry run, do not push to Transifex
  --key-generator=source|hash            [default: source] use hashed or source based keys
  --no-wait                              disable polling for upload results
  --purge                                purge content on Transifex
  --secret=secret                        native project secret
  --token=token                          native project public token
  --with-tags-only=with-tags-only        push strings with specific tags
  --without-tags-only=without-tags-only  push strings without specific tags

DESCRIPTION
  Parse .js, .ts, .jsx, .tsx, .html and .vue files and detect phrases marked for
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
  txjs-cli push --no-wait
  txjs-cli push --key-generator=hash
  txjs-cli push --append-tags="master,release:2.5"
  txjs-cli push --with-tags-only="home,error"
  txjs-cli push --without-tags-only="custom"
  txjs-cli push --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret txjs-cli push
```

## `txjs-cli invalidate`

invalidate and refresh CDS cache

```
USAGE
  $ txjs-cli invalidate

OPTIONS
  --cds-host=cds-host  CDS host URL
  --purge              force delete CDS cached content
  --secret=secret      native project secret
  --token=token        native project public token

DESCRIPTION
  Content for delivery is cached in CDS and refreshed automatically every hour.
  This command triggers a refresh of cached content on the fly.

  By default, invalidation does not remove existing cached content, but
  starts the process of updating with latest translations from Transifex.

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
