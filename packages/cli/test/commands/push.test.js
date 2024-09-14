/* globals describe */
const { expect, test } = require('@oclif/test');

describe('push command', () => {
  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--fake'])
    .it('extracts simple phrases', (cws) => {
      expect(cws.stdout).to.contain('Processed 1 file(s) and found 8 translatable phrases');
      expect(cws.stdout).to.contain('Content detected in 1 file(s)');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.contain('f2138b2131e064313c369b20006549df: Text 1');
      expect(cws.stdout).to.contain('5d47152bcd597dd6adbff4884374aaad: Text 2');
      expect(cws.stdout).to.contain('3cd62915590816fdbf53852e44ee675a: Text 3');
      expect(cws.stdout).to.contain('33f5afa925f1464280d72d6d9086057c: Text 4');
      expect(cws.stdout).to.contain('occurrences: ["test/fixtures/simple.js"]');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--fake', '-v'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.contain('Text 1');
      expect(cws.stdout).to.contain('Text 2');
      expect(cws.stdout).to.contain('Text 3');
      expect(cws.stdout).to.contain('Text 4');
      expect(cws.stdout).to.contain('occurrences: ["test/fixtures/simple.js"]');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.contain('f2138b2131e064313c369b20006549df: Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/', '--fake', '-v'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.contain('Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.js', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.contain('f2138b2131e064313c369b20006549df: Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.js', '--fake', '-v'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.contain('Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.foo', '--fake', '-v', '--key-generator=hash'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.not.contain('f2138b2131e064313c369b20006549df: Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/*.foo', '--fake', '-v'])
    .it('outputs strings on verbose mode', (cws) => {
      expect(cws.stdout).to.not.contain('Text 1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/tags.js', '--fake', '-v', '--append-tags=custom'])
    .it('append tags', (cws) => {
      expect(cws.stdout).to.contain('tags: ["tag1","tag2","custom"]');
      expect(cws.stdout).to.contain('tags: ["tag2","tag3","custom"]');
      expect(cws.stdout).to.contain('tags: ["custom"]');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/tags.js', '--fake', '-v', '--with-tags-only=tag1'])
    .it('filters-in tags', (cws) => {
      expect(cws.stdout).to.not.contain('tag3');
      expect(cws.stdout).to.contain('tag1');
    });

  test
    .stdout()
    .command(['push', 'test/fixtures/tags.js', '--fake', '-v', '--without-tags-only=tag1'])
    .it('filters-out tags', (cws) => {
      expect(cws.stdout).to.contain('tag2');
      expect(cws.stdout).to.contain('tag3');
      expect(cws.stdout).to.not.contain('tag1');
    });

  test
    .nock('https://cds.svc.wordsmith.net', (api) => api
      .post('/content')
      .reply(200, {
        data: {
          id: '1',
          links: {
            job: '/jobs/content/1',
          },
        },
      }))
    .nock('https://cds.svc.wordsmith.net', (api) => api
      .get('/jobs/content/1')
      .reply(200, {
        data: {
          details: {
            created: 2,
            updated: 2,
            skipped: 0,
            deleted: 0,
            failed: 0,
          },
          errors: [],
          status: 'completed',
        },
      }))
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--secret=s', '--token=t'])
    .it('pushes content', (cws) => {
      expect(cws.stdout).to.contain('Created strings: 2');
      expect(cws.stdout).to.contain('Updated strings: 2');
    });

  test
    .nock('https://cds.svc.wordsmith.net', (api) => api
      .post('/content')
      .reply(200, {
        data: {
          id: '1',
          links: {
            job: '/jobs/content/1',
          },
        },
      }))
    .nock('https://cds.svc.wordsmith.net', (api) => api
      .get('/jobs/content/1')
      .reply(200, {
        data: {
          details: {
            created: 2,
            updated: 2,
            skipped: 0,
            deleted: 0,
            failed: 0,
          },
          errors: [],
          status: 'completed',
        },
      }))
    .stdout()
    .command(['push', 'test/fixtures/simple.js', '--dry-run', '--secret=s', '--token=t'])
    .it('pushes conten with dry-run', (cws) => {
      expect(cws.stdout).to.contain('Created strings: 2');
      expect(cws.stdout).to.contain('Updated strings: 2');
    });

  test
    .nock('https://cds.svc.wordsmith.net', (api) => api
      .post('/content')
      .reply(403))
    .stdout()
    .stderr()
    .command(['push', 'test/fixtures/simple.js', '--secret=s', '--token=t'])
    .exit(2)
    .it('handles push error', (cws) => {
      expect(cws.stdout).to.contain('Uploading content to Wordsmith... Failed');
    });
});
