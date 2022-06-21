

declare class JsonApiResource {
}

declare export class TransifexApi {
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

declare export var transifexApi: TransifexApi;
