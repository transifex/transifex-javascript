/* eslint no-shadow: 0 */

require('colors');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { Command, flags } = require('@oclif/command');
const shelljs = require('shelljs');
const { glob } = require('glob');
const { cli } = require('cli-ux');
const extractPhrases = require('../api/extract');
const uploadPhrases = require('../api/upload');
const { stringToArray } = require('../api/utils');
const { SourceStringSet } = require('../api/strings');

/**
 * Test if path is folder
 *
 * @param {String} path
 * @returns {Boolean}
 */
function isFolder(path) {
  try {
    const stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

class PushCommand extends Command {
  async run() {
    const { args, flags } = this.parse(PushCommand);
    const pwd = `${shelljs.pwd()}`;
    let filePattern = path.isAbsolute(args.pattern)
      ? args.pattern
      : path.join(pwd, args.pattern);

    if (isFolder(filePattern)) {
      filePattern = path.join(filePattern, '**/*.{js,jsx}');
    }

    const globalTags = stringToArray(flags.tags);
    const extraFunctions = stringToArray(flags['extra-functions']);

    this.log('Parsing all files to detect translatable content...');

    const allFiles = await new Promise((resolve, reject) => {
      glob(filePattern, (err, files) => {
        if (err) return reject(err);
        return resolve(files);
      });
    });

    let emptyFiles = 0;
    const errorFiles = [];
    const payload = new SourceStringSet();
    const tree = {};

    const bar = cli.progress({
      format: '⸨{bar}⸩ {value}/{total} {file}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '⠂',
      stream: process.stdout,
    });
    bar.start(allFiles.length, 0);

    _.each(allFiles, (file) => {
      const relativeFile = file.replace(pwd, '').slice(1);
      bar.increment({ file: relativeFile.gray });
      try {
        const data = extractPhrases({
          filename: relativeFile,
          globalTags,
          extraFunctions,
        });
        tree[relativeFile] = data;
        if (_.isEmpty(data)) {
          emptyFiles += 1;
        } else {
          payload.update(data.values());
        }
      } catch (error) {
        errorFiles.push({
          file: relativeFile,
          error,
        });
      }
    });

    bar.stop();

    this.log([
      `${'✓'.green} Processed ${allFiles.length.toString().green} file(s) and found`,
      `${payload.length.toString().green} translatable phrases.`,
    ].join(' '));

    this.log(`${'✓'.green} Content detected in ${(allFiles.length - emptyFiles).toString().green} file(s).`);

    if (flags.verbose) {
      _.each(tree, (data, file) => {
        if (!data.length) return;
        this.log(file.green);
        _.forEach(data.entries(), ([key, value]) => {
          this.log(`  └─ ${key}: ${value.sourceString.underline}`);
          _.forEach(
            ['context', 'characterLimit', 'developerComment', 'occurrences', 'tags'],
            (metaKey) => {
              const meta = value[metaKey];
              if ((_.isObject(meta) || _.isArray(meta) || _.isUndefined(meta)) && _.isEmpty(meta)) {
                return;
              }
              this.log(`    └─ ${metaKey}: ${JSON.stringify(meta)}`.gray);
            },
          );
        });
      });
    }

    if (errorFiles.length) {
      this.log(`⚠ Failed to process ${errorFiles.length} file(s).`.yellow);
      if (flags.verbose) {
        _.each(errorFiles, ({ file, error }) => {
          this.log(`${'✘'.red} ${file}`);
          if (flags.verbose) {
            this.log(error.toString().red);
          }
        });
      }
    }

    if (!flags['dry-run']) {
      if (payload.length === 0) {
        this.log('⚠ Nothing to upload.'.yellow);
        process.exit();
      }

      let cdsHost = process.env.TRANSIFEX_CDS_HOST || 'https://cds.svc.transifex.net';
      let projectToken = process.env.TRANSIFEX_TOKEN;
      let projectSecret = process.env.TRANSIFEX_SECRET;

      if (flags.token) projectToken = flags.token;
      if (flags.secret) projectSecret = flags.secret;
      if (flags['cds-host']) cdsHost = flags['cds-host'];

      if (!projectToken || !projectSecret) {
        this.log(`${'✘'.red} Cannot push content, credentials are missing.`);
        this.log('Tip: Set TRANSIFEX_TOKEN and TRANSIFEX_SECRET environment variables'.yellow);
        process.exit();
      }

      cli.action.start('Uploading content to Transifex', '', { stdout: true });
      try {
        const res = await uploadPhrases(payload, {
          url: cdsHost,
          token: projectToken,
          secret: projectSecret,
          purge: flags.purge,
        });
        if (res.success) {
          cli.action.stop('Success'.green);
          this.log(`${'✓'.green} Successfully pushed strings to Transifex.`);
          this.log(`Created strings: ${(res.data.created || 0).toString().green}`);
          this.log(`Updated strings: ${(res.data.updated || 0).toString().green}`);
          this.log(`Skipped strings: ${(res.data.skipped || 0).toString().green}`);
          this.log(`Deleted strings: ${(res.data.deleted || 0).toString().green}`);
          this.log(`Failed strings: ${(res.data.failed || 0).toString().red}`);
          this.log(`Errors: ${(res.data.errors || []).length.toString().red}`);
        } else {
          cli.action.stop('Failed'.red);
          this.log(`Status code: ${res.status}`.red);
          this.error(JSON.stringify(res.data));
        }
      } catch (err) {
        cli.action.stop('Failed'.red);
        throw err;
      }
    }
  }
}

PushCommand.description = `Detect translatable strings and push content to Transifex
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
`;

PushCommand.args = [{
  name: 'pattern',
  description: 'file pattern to scan for strings',
  default: '**/*.{js,jsx}',
  required: false,
}];

PushCommand.flags = {
  'dry-run': flags.boolean({
    description: 'Dry run, do not push to Transifex',
    default: false,
  }),
  verbose: flags.boolean({
    char: 'v',
    description: 'Verbose output',
    default: false,
  }),
  purge: flags.boolean({
    description: 'Purge content on Transifex',
    default: false,
  }),
  token: flags.string({
    description: 'Native project public token',
    default: '',
  }),
  secret: flags.string({
    description: 'Native project secret',
    default: '',
  }),
  tags: flags.string({
    description: 'Globally tag strings',
    default: '',
  }),
  'cds-host': flags.string({
    description: 'CDS host URL',
    default: '',
  }),
  'extra-functions': flags.string({
    description: 'Extra functions to capture, comma-separated',
    default: '',
  }),
};

module.exports = PushCommand;
