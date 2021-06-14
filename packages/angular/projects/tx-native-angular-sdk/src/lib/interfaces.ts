/* eslint-disable @typescript-eslint/naming-convention */
export interface ITranslationServiceConfig {
  token: string;
  cdsHost?: string;
  filterTags?: string;
  cache?: () => void;
  missingPolicy?: () => void;
  errorPolicy?: () => void;
  stringRenderer?: () => void;
}

export interface ILanguage {
  code: string;
  name: string;
  localized_name: string;
}

export interface ITranslateParams {
  _context?: string;
  _comment?: string;
  _charlimit?: number;
  _tags?: string;
  _key?: string;
  _escapeVars?: boolean;
  _inline?: boolean;
  sanitize?: boolean;
}
