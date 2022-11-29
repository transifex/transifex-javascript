/* eslint-disable no-await-in-loop */
require('@colors/colors');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { Command, Flags } = require('@oclif/core');
const { CliUx } = require('@oclif/core');
const { downloadLanguages, downloadPhrases } = require('../api/download');

class PullCommand extends Command {
  async run() {
    const { flags } = await this.parse(PullCommand);

    let cdsHost = process.env.TRANSIFEX_CDS_HOST || 'https://cds.svc.transifex.net';
    let projectToken = process.env.TRANSIFEX_TOKEN;
    let projectSecret = process.env.TRANSIFEX_SECRET;

    if (flags.token) projectToken = flags.token;
    if (flags.secret) projectSecret = flags.secret;
    if (flags['cds-host']) cdsHost = flags['cds-host'];

    if (!projectToken || !projectSecret) {
      this.log(`${'✘'.red} Cannot pull content, credentials are missing.`);
      this.log('Tip: Set TRANSIFEX_TOKEN and TRANSIFEX_SECRET environment variables'.yellow);
      process.exit();
    }

    try {
      // get source lang
      const params = {
        cdsHost,
        token: projectToken,
        secret: projectSecret,
        filterTags: flags['filter-tags'],
        filterStatus: flags['filter-status'],
        locale: '',
      };
      const locales = [];
      if (flags.locale) {
        locales.push(flags.locale);
      } else {
        CliUx.ux.action.start('Getting available languages', '', { stdout: true });
        const languages = await downloadLanguages(params);
        _.each(languages.data, (entry) => {
          if (entry.code) {
            locales.push(entry.code);
          }
        });
      }
      for (let i = 0; i < locales.length; i += 1) {
        params.locale = locales[i];
        CliUx.ux.action.start(
          `Pulling content for ${params.locale.green} locale (${i + 1} of ${locales.length})`,
          '',
          { stdout: true },
        );
        const { data } = await downloadPhrases(params);
        const json = flags.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        if (flags.folder) {
          fs.writeFileSync(path.join(flags.folder, `${params.locale}.json`), json);
        }
        if (!flags.folder) {
          this.log(json);
        }
      }
      CliUx.ux.action.stop('Done'.green);
    } catch (err) {
      CliUx.ux.action.stop('Failed'.red);
      this.error(err);
    }
  }
}

PullCommand.description = `Pull content from Transifex for offline caching
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
`;

PullCommand.args = [];

PullCommand.flags = {
  token: Flags.string({
    description: 'native project public token',
    default: '',
  }),
  secret: Flags.string({
    description: 'native project secret',
    default: '',
  }),
  folder: Flags.string({
    char: 'f',
    description: 'output as files to folder',
    default: '',
  }),
  locale: Flags.string({
    char: 'l',
    description: 'pull specific language locale code',
    default: '',
  }),
  pretty: Flags.boolean({
    description: 'beautify JSON output',
    default: false,
  }),
  'filter-tags': Flags.string({
    description: 'filter over specific tags',
    default: '',
  }),
  'filter-status': Flags.string({
    description: 'filter over translation status',
    default: '',
    options: ['reviewed', 'proofread', 'finalized'],
  }),
  'cds-host': Flags.string({
    description: 'CDS host URL',
    default: '',
  }),
};

module.exports = PullCommand;
