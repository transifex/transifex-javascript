import { createNativeInstance, explodePlurals } from '@transifex/native';

export default class TransifexI18next {
  constructor(services, options) {
    this.type = 'backend';
    this.init(services, options);
  }

  init(services, backendOptions) {
    this.tx = createNativeInstance(backendOptions);
  }

  read(language, namespace, callback) {
    this.tx.fetchTranslations(language).then(() => {
      callback(null,
        this._convertPlurals(this.tx.cache.getTranslations(language)));
    }).catch((err) => {
      callback(err, null);
    });
  }

  readMulti(languages, namespaces, callback) {
    const promises = [];
    languages.forEach((language) => {
      promises.push(this.tx.fetchTranslations(language));
    });

    Promise.all(promises).then(() => {
      const data = {};
      languages.forEach((language) => {
        data[language] = {
          translations:
            this._convertPlurals(this.tx.cache.getTranslations(language)),
        };
      });
    }).catch((err) => {
      callback(err, null);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _convertPlurals(translations) {
    const data = {};
    Object.keys(translations).forEach((key) => {
      if (!key.endsWith('_txplural')) {
        data[key] = translations[key];
        return;
      }
      const baseKey = key.slice(0, -('_txplural'.length));
      const plurals = explodePlurals(translations[key])[1];
      Object.keys(plurals).forEach((plural) => {
        data[`${baseKey}_${plural}`] = plurals[plural];
      });
    });
    return data;
  }
}
