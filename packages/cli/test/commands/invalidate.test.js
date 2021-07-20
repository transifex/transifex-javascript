/* globals describe */
const { expect, test } = require('@oclif/test');

describe('invalidate command', () => {
  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .post('/invalidate')
      .reply(200, {
        data: {
          status: 'success',
          token: 't',
          count: 5,
        },
      }))
    .stdout()
    .command(['invalidate', '--secret=s', '--token=t'])
    .it('invalidates content', (ctx) => {
      expect(ctx.stdout).to.contain('5 records invalidated');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .post('/purge')
      .reply(200, {
        data: {
          status: 'success',
          token: 't',
          count: 10,
        },
      }))
    .stdout()
    .command(['invalidate', '--purge', '--secret=s', '--token=t'])
    .it('invalidates content', (ctx) => {
      expect(ctx.stdout).to.contain('10 records invalidated');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .post('/invalidate')
      .reply(403))
    .stdout()
    .stderr()
    .command(['invalidate', '--secret=s', '--token=t'])
    .exit(2)
    .it('handles invalidate error', (ctx) => {
      expect(ctx.stdout).to.contain('Invalidating CDS cache... Failed');
    });
});
