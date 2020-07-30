# Transifex Native CLI

A command line tool that parses `.js` or `.jsx` source files, extracts phrases marked for localization by [Transifex Native](https://www.transifex.com/native/) and pushes them to [Transifex](https:/www.transifex.com) for translation.

Related packages:
* [@transifex/native](https://www.npmjs.com/package/@transifex/native)
* [@transifex/react](https://www.npmjs.com/package/@transifex/react)

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

Detect translatable strings and push content to Transifex

```
USAGE
  $ txjs-cli push [PATTERN]

ARGUMENTS
  PATTERN  [default: **/*.{js,jsx}] file pattern to scan for strings

OPTIONS
  -v, --verbose        Verbose output
  --cds-host=cds-host  CDS host URL
  --dry-run            Dry run, do not push to Transifex
  --purge              Purge content on Transifex
  --secret=secret      Native project secret
  --token=token        Native project public token
  --tags=tags          Globally add tags to strings

DESCRIPTION
  Parse .js or .jsx files and detect phrases marked for
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
  txjs-cli push --tags="master,release:2.5"
  txjs-cli push --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret txjs-cli push
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
