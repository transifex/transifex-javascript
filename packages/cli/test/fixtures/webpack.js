import { tx, t } from '@transifex/native';

function log() {}

export default function foo() {
  log(t('Text 1', {
    _context: 'foo',
    _tags: 'tag1,tag2',
    _charlimit: 10,
    _comment: 'comment',
  }));
  log(t('Text 2'));
  log(tx.translate('Text 3'));
  log(tx.translate('Text 4'));
}
