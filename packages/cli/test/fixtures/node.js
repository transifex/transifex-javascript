const { t, ut, Transifex } = require('@transifex/core');

function log() {}

function foo() {
  log(t('Text 1', {
    _context: 'foo',
    _tags: 'tag1,tag2',
    _charlimit: 10,
    _comment: 'comment',
  }));
  log(ut('Text 2'));
  log(Transifex.t('Text 3'));
  log(Transifex.ut('Text 4'));
}

module.exports = foo;
