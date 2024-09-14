const { ws, t } = require('@wordsmith/native');

function log() {}

function foo() {
  log(t('Text 1', {
    _context: 'foo',
    _tags: 'tag1,tag2',
    _charlimit: 10,
    _comment: 'comment',
  }));
  log(t('Text 2'));
  log(ws.translate('Text 3'));
  log(ws.translate('Text 4'));
}

module.exports = foo;
