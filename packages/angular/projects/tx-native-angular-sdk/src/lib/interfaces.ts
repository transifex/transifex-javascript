/* eslint-disable @typescript-eslint/naming-convention */
export interface ITranslationServiceConfig {
  token: string;
  cdsHost?: string;
  filterTags?: string;
  cache?: () => void;
  missingPolicy?: IPolicy;
  errorPolicy?: IPolicy;
  stringRenderer?: IStringRenderer;
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

export interface IPolicy {
  handle(sourceString: string, localeCode: string): string;
}

export interface IStringRenderer {
  render(sourceString: string, localeCode: string, params: ITranslateParams): string;
}
