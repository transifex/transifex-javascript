import { tx, t, createInstance } from '@transifex/native';

const Instance = createInstance();

// valid
t('Text 1');
t('Text 2');
tx.translate('Text 3');
Instance.translate('Text 4');

const text = 'foo';
t(text);
t('Text 1' + text);
Instance.translate(text);
Instance.translate(`templated text`);

// invalid
t('');
Instance.translateme('Text 5');
Instance.translate();
Instance.translate({ foo: 'bar' });
Instance.translate(5);
Instance.translate('non-deterministic string' + 1);
