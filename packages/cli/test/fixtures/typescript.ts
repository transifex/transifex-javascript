import { t } from '@transifex/native';

interface Item {
  name: string;
  id: number;
}

class ItemRegistry {
  name: string;
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}

const item: Item = new ItemRegistry(t('Shoes'), 1);
