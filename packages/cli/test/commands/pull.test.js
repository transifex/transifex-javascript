/* globals describe */
const { expect, test } = require('@oclif/test');

describe('pull command', () => {
  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/languages')
      .reply(200, {
        data: [{
          code: 'en',
          name: 'English',
          localized_name: 'English',
          rtl: false,
        }],
        meta: { source_lang_code: 'en' },
      }))
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/content/en')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '--secret=s', '--token=t'])
    .it('pulls content', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/content/fr')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--secret=s', '--token=t'])
    .it('pulls content with locale filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/content/fr?filter[tags]=atag')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--filter-tags=atag', '--secret=s', '--token=t'])
    .it('pulls content with tags filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/content/fr?filter[status]=reviewed')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--filter-status=reviewed', '--secret=s', '--token=t'])
    .it('pulls content with status filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/content/fr?filter[tags]=atag&filter[status]=reviewed')
      .reply(200, {
        data: [{
          foo: 'bar',
        }],
      }))
    .stdout()
    .command(['pull', '-l=fr', '--filter-status=reviewed', '--filter-tags=atag', '--secret=s', '--token=t'])
    .it('pulls content with status & tags filter', (ctx) => {
      expect(ctx.stdout).to.contain('foo');
      expect(ctx.stdout).to.contain('bar');
    });

  test
    .nock('https://cds.svc.transifex.net', (api) => api
      .get('/languages')
      .reply(403))
    .stdout()
    .stderr()
    .command(['pull', '--secret=s', '--token=t'])
    .exit(2)
    .it('handles pull error', (ctx) => {
      expect(ctx.stdout).to.contain('Failed');
    });
});
