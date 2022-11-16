interface AnyDict {
  [key: string]: any;
}

interface StringDict {
  [key: string]: string;
}

declare class JsonApiResource {
  constructor({
    id: string,
    attributes: AnyDict,
    relationships: AnyDict,
    links: StringDict,
  });
  get(key: string): any;
  set(key: string, value: any): void;
  reload(include: string[]): Promise<void>;
  static get(arg:string | AnyDict): Promise<JsonApiResource>;
  fetch(relationshipName: string, force: boolean): Promise<JsonApiResource | Collection>;
  save(arg: AnyDict | string[]): Promise<void>;
  static create({
    id: string,
    attributes: AnyDict,
    relationships: AnyDict,
    links: StringDict,
  }): Promise<JsonApiResource>;
  delete(): Promise<void>;
  change(field: string, value:JsonApiResource | null): Promise<void>;
  add(field: string, values: JsonApiResource[]): Promise<void>;
  reset(field: string, values: JsonApiResource[]): Promise<void>;
  remove(field: string, values: JsonApiResource[]): Promise<void>;
  static list(): Collection;
  static extra(AnyDict): Collection;
  static filter(filters: AnyDict): Collection;
  static page(arg: AnyDict | string): Collection;
  static include(...args: string[]): Collection;
  static sort(...args: string[]): Collection;
  static fields(...args: string[]): Collection;
  static all(): Iterable<JsonApiResource>;
  static allPages(): Iterable<Collection>;
}

declare class Collection {
  fetch(): Promise<void>;
  getNext(): Promise<Collection>;
  getPrevious(): Promise<Collection>;
  extra(AnyDict): Collection;
  filter(filters: AnyDict): Collection;
  page(arg: AnyDict | string): Collection;
  include(...args: string[]): Collection;
  sort(...args: string[]): Collection;
  fields(...args: string[]): Collection;
  all(): Iterable<JsonApiResource>;
  allPages(): Iterable<Collection>;
}

type AuthFunction = () => string;
type AuthArgument = string | AuthFunction;

export declare class TransifexApi {
  constructor({ host: string, auth: AuthArgument });
  setup({ host: string, auth: AuthArgument }): void;

  Organization: typeof JsonApiResource;
  User: typeof JsonApiResource;
  Language: typeof JsonApiResource;
  Project: typeof JsonApiResource;
  ProjectWebhook: typeof JsonApiResource;
  Resource: typeof JsonApiResource;
  ResourceString: typeof JsonApiResource;
  ResourceStringsAsyncDownload: typeof JsonApiResource;
  ResourceStringsAsyncUpload: typeof JsonApiResource;
  ResourceStringComment: typeof JsonApiResource;
  I18nFormat: typeof JsonApiResource;
  ContextScreenshotMap: typeof JsonApiResource;
  ContextScreenshot: typeof JsonApiResource;
  OrganizationActivityReportsAsyncDownload: typeof JsonApiResource;
  ProjectActivityReportsAsyncDownload: typeof JsonApiResource;
  ResourceActivityReportsAsyncDownload: typeof JsonApiResource;
  TeamActivityReportsAsyncDownload: typeof JsonApiResource;
  ResourceLanguageStats: typeof JsonApiResource;
  ResourceTranslation: typeof JsonApiResource;
  ResourceTranslationsAsyncDownload: typeof JsonApiResource;
  ResourceTranslationsAsyncUpload: typeof JsonApiResource;
  TeamMembership: typeof JsonApiResource;
  Team: typeof JsonApiResource;
  TmxAsyncDownload: typeof JsonApiResource;
  TmxAsyncUpload: typeof JsonApiResource;
  ResourceStringsRevision: typeof JsonApiResource;

  organizations: typeof JsonApiResource;
  users: typeof JsonApiResource;
  languages: typeof JsonApiResource;
  projects: typeof JsonApiResource;
  project_webhooks: typeof JsonApiResource;
  resources: typeof JsonApiResource;
  resource_strings: typeof JsonApiResource;
  resource_strings_async_downloads: typeof JsonApiResource;
  resource_strings_async_uploads: typeof JsonApiResource;
  resource_string_comments: typeof JsonApiResource;
  i18n_formats: typeof JsonApiResource;
  context_screenshot_maps: typeof JsonApiResource;
  context_screenshots: typeof JsonApiResource;
  organization_activity_reports_async_downloads: typeof JsonApiResource;
  project_activity_reports_async_downloads: typeof JsonApiResource;
  resource_activity_reports_async_downloads: typeof JsonApiResource;
  team_activity_reports_async_downloads: typeof JsonApiResource;
  resource_language_stats: typeof JsonApiResource;
  resource_translations: typeof JsonApiResource;
  resource_translations_async_downloads: typeof JsonApiResource;
  resource_translations_async_uploads: typeof JsonApiResource;
  team_memberships: typeof JsonApiResource;
  teams: typeof JsonApiResource;
  tmx_async_downloads: typeof JsonApiResource;
  tmx_async_uploads: typeof JsonApiResource;
  resource_strings_revisions: typeof JsonApiResource;
}

export declare var transifexApi: TransifexApi;
