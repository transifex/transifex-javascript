declare module '@transifex/native' {
  export const tx: any;
  export const t: any;
  export const PseudoTranslationPolicy: any;
  export const SourceStringPolicy: any;
  export const SourceErrorPolicy: any;
  export const ThrowErrorPolicy: any;
  export const MessageFormatRenderer: any;
  export const createNativeInstance: any;

  // Events
  export const FETCHING_TRANSLATIONS = 'FETCHING_TRANSLATIONS';
  export const TRANSLATIONS_FETCHED = 'TRANSLATIONS_FETCHED';
  export const TRANSLATIONS_FETCH_FAILED = 'TRANSLATIONS_FETCH_FAILED';
  export const LOCALE_CHANGED = 'LOCALE_CHANGED';
  export const FETCHING_LOCALES = 'FETCHING_LOCALES';
  export const LOCALES_FETCHED = 'LOCALES_FETCHED';
  export const LOCALES_FETCH_FAILED = 'LOCALES_FETCH_FAILED';
  export const onEvent: any;
  export const offEvent: any;
  export const sendEvent: any;

  // Utils
  export const escape: any;
  export const isString: any;
  export const generateHashedKey: any;
  export const generateKey: any;
  export const isPluralized: any;
  export const explodePlurals: any;
  export const implodePlurals: any;
  export const normalizeLocale: any;
}
