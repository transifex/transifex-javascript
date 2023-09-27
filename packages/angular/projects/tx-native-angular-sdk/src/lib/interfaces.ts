import type { ITranslationConfig, ITranslateParams as ITranslateParamsNative } from '@transifex/native';

export type { ILanguage } from '@transifex/native';

export interface ITranslationServiceConfig extends ITranslationConfig {
  instanceAlias?: string;
}

export interface ITranslateParams extends ITranslateParamsNative {
  _inline?: boolean;
  sanitize?: boolean;
}

export interface ITXInstanceConfiguration {
  alias: string;
  controlled: boolean;
  token: string;
}
