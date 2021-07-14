import { t } from '@transifex/native';

const tags = 'tag4,tag5';

t('Text 1', { _tags: 'tag1,tag2' });
t('Text 2', { _tags: 'tag2,tag3' });
t('Text 3');
t('Text 4', { _tags: tags })