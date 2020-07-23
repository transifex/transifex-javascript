# @transifex/cli

Transifex Native Javascript CLI.

Parse `.js` or `.jsx` files and scan for Transifex Native phrases.
Push phrases to Transifex for localization.

Related packages:
[@transifex/core](https://www.npmjs.com/package/@transifex/core)

# Usage
```sh-session
$ npm install -g @transifex/cli

$ transifexjs-cli COMMAND
running command...

$ transifexjs-cli --help [COMMAND]
USAGE
  $ transifexjs-cli COMMAND
...
```

# Commands
* [`transifexjs-cli help [COMMAND]`](#transifexjs-cli-help-command)
* [`transifexjs-cli push [PATTERN]`](#transifexjs-cli-push-pattern)

## `transifexjs-cli help [COMMAND]`

Display help for transifexjs-cli

```
USAGE
  $ transifexjs-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

## `transifexjs-cli push [PATTERN]`

Detect translatable strings and push content to Transifex

```
USAGE
  $ transifexjs-cli push [PATTERN]

ARGUMENTS
  PATTERN  [default: **/*.{js,jsx}] file pattern to scan for strings

OPTIONS
  -v, --verbose        Verbose output
  --cds-host=cds-host  CDS host URL
  --dry-run            Dry run, do not push to Transifex
  --purge              Purge content on Transifex
  --secret=secret      Native project secret
  --token=token        Native project public token

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
  transifexjs-cli push -v
  transifexjs-cli push *.js
  transifexjs-cli push --dry-run
  transifexjs-cli push --token=mytoken --secret=mysecret
  TRANSIFEX_TOKEN=mytoken TRANSIFEX_SECRET=mysecret transifexjs-cli push
```

# License

Licensed under Apache License 2.0, see [LICENSE](https://github.com/transifex/transifex-javascript/blob/HEAD/LICENSE) file.
