import { JsonApi, Resource as JsonApiResource } from '@transifex/jsonapi'; /* eslint-disable-line max-classes-per-file */

export class TransifexApi extends JsonApi {
  static HOST = 'https://rest.api.transifex.com';
}

class Organization extends JsonApiResource {
  static TYPE = 'organizations';
}
TransifexApi.register(Organization);

class User extends JsonApiResource {
  static TYPE = 'users';
}
TransifexApi.register(User);

class Language extends JsonApiResource {
  static TYPE = 'languages';
}
TransifexApi.register(Language);

class Project extends JsonApiResource {
  static TYPE = 'projects';
}
TransifexApi.register(Project);

class ProjectWebhook extends JsonApiResource {
  static TYPE = 'project_webhooks';
}
TransifexApi.register(ProjectWebhook);

class Resource extends JsonApiResource {
  static TYPE = 'resources';
}
TransifexApi.register(Resource);

class ResourceString extends JsonApiResource {
  static TYPE = 'resource_strings';
}
TransifexApi.register(ResourceString);

class ResourceStringAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_string_async_downloads';
}
TransifexApi.register(ResourceStringAsyncDownload);

class ResourceStringAsyncUpload extends JsonApiResource {
  static TYPE = 'resource_string_async_downloads';
}
TransifexApi.register(ResourceStringAsyncUpload);

class ResourceStringComment extends JsonApiResource {
  static TYPE = 'Resource_string_comments';
}
TransifexApi.register(ResourceStringComment);

class I18nFormat extends JsonApiResource {
  static TYPE = 'i18n_formats';
}
TransifexApi.register(I18nFormat);

class ContextScreenshotMap extends JsonApiResource {
  static TYPE = 'context_screenshot_maps';
}
TransifexApi.register(ContextScreenshotMap);

class ContextScreenshot extends JsonApiResource {
  static TYPE = 'context_screenshots';
}
TransifexApi.register(ContextScreenshot);

class OrganizationActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'organization_activity_reports_async_downloads';
}
TransifexApi.register(OrganizationActivityReportsAsyncDownload);

class ProjectActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'project_activity_reports_async_downloads';
}
TransifexApi.register(ProjectActivityReportsAsyncDownload);

class ResourceActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_activity_reports_async_downloads';
}
TransifexApi.register(ResourceActivityReportsAsyncDownload);

class TeamActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'team_activity_reports_async_downloads';
}
TransifexApi.register(TeamActivityReportsAsyncDownload);

class ResourceLanguageStat extends JsonApiResource {
  static TYPE = 'resource_language_stats';
}
TransifexApi.register(ResourceLanguageStat);

class ResourceTranslation extends JsonApiResource {
  static TYPE = 'resource_translations';
}
TransifexApi.register(ResourceTranslation);

class ResourceTranslationAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_translations_async_downloads';
}
TransifexApi.register(ResourceTranslationAsyncDownload);

class ResourceTranslationAsyncUpload extends JsonApiResource {
  static TYPE = 'resource_translations_async_uploads';
}
TransifexApi.register(ResourceTranslationAsyncUpload);

class TeamMembership extends JsonApiResource {
  static TYPE = 'team_memberships';
}
TransifexApi.register(TeamMembership);

class Team extends JsonApiResource {
  static TYPE = 'teams';
}
TransifexApi.register(Team);

class TmxAsyncDownload extends JsonApiResource {
  static TYPE = 'tmx_async_downloads';
}
TransifexApi.register(TmxAsyncDownload);

class TmxAsyncUpload extends JsonApiResource {
  static TYPE = 'tmx_async_uploads';
}
TransifexApi.register(TmxAsyncUpload);

export const transifexApi = new TransifexApi();
