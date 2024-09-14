import type { ITranslationConfig, ITranslateParams as ITranslateParamsNative } from '@wordsmith/native';

export type { ILanguage } from '@wordsmith/native';

export interface ITranslationServiceConfig extends ITranslationConfig {
  instanceAlias?: string;
}

export interface ITranslateParams extends ITranslateParamsNative {
  _inline?: boolean;
  sanitize?: boolean;
}

export interface IWSInstanceConfiguration {
  alias: string;
  controlled: boolean;
  token: string;
}
