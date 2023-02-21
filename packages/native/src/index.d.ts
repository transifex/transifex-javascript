declare module '@transifex/native' {
  export interface ITranslateParams {
    [key: string]: unknown;
    _charlimit?: number;
    _comment?: string;
    _context?: string;
    _escapeVars?: boolean;
    _key?: string;
    _tags?: string;
  }

  export interface ITranslationConfig {
    cache?: IMemoryCache;
    cdsHost?: string;
    currentLocale?: string;
    errorPolicy?: IErrorPolicy;
    fetchInterval?: number;
    fetchTimeout?: number;
    filterStatus?: string;
    filterTags?: string;
    missingPolicy?: ITranslationPolicy;
    secret?: string;
    stringRenderer?: IMessageFormatRenderer;
    token?: string;
  }

  type Plurals = [string, Record<string, string>];

  interface ILanguage {
    code: string;
    localized_name: string;
    name: string;
    rtl: boolean;
  }

  interface IMemoryCache {
    get(key: string, localeCode: string): Record<string, string>;
    getTranslations(localeCode: string): Record<string, string>;
    hasTranslations(localeCode: string): boolean;
    isStale(localeCode: string): boolean;
    update(localeCode: string, translations: Record<string, string>): void;
  }

  interface IMessageFormatRenderer {
    render(sourceString: string, localeCode: string, params: ITranslateParams): string;
  }

  interface ITranslationPolicy {
    handle(sourceString: string, localeCode: string): string;
  }

  interface IErrorPolicy {
    handle(error: Error, sourceString: string, localeCode: string, params: ITranslateParams): string;
  }

  export class TxNative implements ITranslationConfig {
    cache: IMemoryCache;
    cdsHost: string;
    childInstances: TxNative[];
    currentLocale: string;
    errorPolicy: IErrorPolicy;
    fetchedTags?: Record<string, string[]>;
    fetchInterval: number;
    fetchTimeout: number;
    filterStatus: string;
    filterTags: string;
    languages: ILanguage[];
    locales: string[];
    missingPolicy: ITranslationPolicy;
    secret: string;
    stringRenderer: IMessageFormatRenderer;
    token: string;

    controllerOf(instance: TxNative): Promise<TxNative>;

    fetchTranslations(localeCode: string, config?: { filterTags?: string; refresh?: boolean }): Promise<void>;

    getCurrentLocale(): string;

    getLanguages(config?: { refresh?: boolean }): Promise<ILanguage[]>;

    getLocales(config?: { refresh?: boolean }): Promise<string[]>;

    init(config: ITranslationConfig): void;

    invalidateCDS(config?: { purge?: boolean }): Promise<{ count: number; status: number; token: number }>;

    isCurrent(localeCode: string): boolean;

    pushSource(
      payload: Record<string, {
        meta: {
          character_limit: number;
          context: string;
          developer_comment: string;
          occurrences: string[];
          tags: string[];
        };
        string: string;
      }>,
      config?: { noWait: boolean; overrideTags: boolean; purge: boolean }
    ): Promise<{
      created: number;
      deleted: number;
      errors: string[];
      failed: number;
      jobUrl: string;
      skipped: number;
      status: string;
      updated: number;
    }>;

    setCurrentLocale(localeCode: string): Promise<void>;

    translate(sourceString: string, params?: ITranslateParams): string;

    translateLocale(localeCode: string, sourceString: string, params?: ITranslateParams): string;
  }

  export class MessageFormatRenderer implements IMessageFormatRenderer {
    render(sourceString: string, localeCode: string, params: ITranslateParams): string;
  }

  export class PseudoTranslationPolicy implements ITranslationPolicy {
    handle(sourceString: string, _localeCode: string): string;
  }

  export class SourceErrorPolicy implements IErrorPolicy {
    handle(_error: Error, sourceString: string, _localeCode: string, _params: ITranslateParams): string;
  }

  export class SourceStringPolicy implements ITranslationPolicy {
    handle(sourceString: string, _localeCode: string): string;
  }

  export class ThrowErrorPolicy implements IErrorPolicy {
    handle(error: Error, sourceString: string, _localeCode: string, _params: ITranslateParams): never;
  }

  export const FETCHING_TRANSLATIONS = 'FETCHING_TRANSLATIONS';

  export const TRANSLATIONS_FETCHED = 'TRANSLATIONS_FETCHED';

  export const TRANSLATIONS_FETCH_FAILED = 'TRANSLATIONS_FETCH_FAILED';

  export const LOCALE_CHANGED = 'LOCALE_CHANGED';

  export const FETCHING_LOCALES = 'FETCHING_LOCALES';

  export const LOCALES_FETCHED = 'LOCALES_FETCHED';

  export const LOCALES_FETCH_FAILED = 'LOCALES_FETCH_FAILED';

  type EventTypes =
    | typeof FETCHING_LOCALES
    | typeof FETCHING_TRANSLATIONS
    | typeof LOCALE_CHANGED
    | typeof LOCALES_FETCH_FAILED
    | typeof LOCALES_FETCHED
    | typeof TRANSLATIONS_FETCH_FAILED
    | typeof TRANSLATIONS_FETCHED;

  interface EventPayload {
    filterTags: string;
    localeCode: string;
  }

  export function createNativeInstance(initOptions: ITranslationConfig): TxNative;

  export function escape(unsafe: string): string;

  export function explodePlurals(str: string): Plurals;

  export function generateHashedKey(str: string, options?: { _context?: string; _key?: string }): string;

  export function generateKey(str: string, options?: { _context?: string; _key?: string }): string;

  export function implodePlurals(plurals: Plurals, count: string): string;

  export function isPluralized(str: string): boolean;

  export function isString(obj: unknown): boolean;

  export function normalizeLocale(locale: string): string;

  export function offEvent(eventType: EventTypes, fn: (payload: EventPayload | null, caller: TxNative) => void): void;

  export function onEvent(eventType: EventTypes, fn: (payload: EventPayload | null, caller: TxNative) => void): void;

  export function sendEvent(eventType: EventTypes, payload: EventPayload | null, caller: TxNative): void;

  export function sleep(msec: number): Promise<void>;

  export function t(str: string, params?: ITranslateParams): string;

  export const tx: TxNative;
}
