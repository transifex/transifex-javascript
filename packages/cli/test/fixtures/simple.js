import { tx, t, createInstance } from '@transifex/native';

const Instance = createInstance();

// valid
t('Text 1');
t('Text 2');
tx.translate('Text 3');
Instance.translate('Text 4');

// invalid
Instance.translateme('Text 5');
Instance.translate();
Instance.translate({ foo: 'bar' });
Instance.translate(5);

const text = 'foo';
t(text);
Instance.translate(text);
