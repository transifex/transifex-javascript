import { JsonApi, Resource as JsonApiResource } from '@transifex/jsonapi'; /* eslint-disable-line max-classes-per-file */

export class TransifexApi extends JsonApi {
  static HOST = 'https://rest.api.transifex.com';
}

async function download({ interval = 5, ...data }) {
  // 'this' is a Resource subclass
  const resource = await this.create(data);
  while (!resource.redirect) {
    /* eslint-disable no-await-in-loop */
    await new Promise((r) => setTimeout(r, interval * 1000)); // sleep
    await resource.reload();
    /* eslint-enable */
  }
  return resource.follow();
}

class Organization extends JsonApiResource {
  static TYPE = 'organizations';
}
TransifexApi.register(Organization, 'Organization');

class User extends JsonApiResource {
  static TYPE = 'users';
}
TransifexApi.register(User, 'User');

class Language extends JsonApiResource {
  static TYPE = 'languages';
}
TransifexApi.register(Language, 'Language');

class Project extends JsonApiResource {
  static TYPE = 'projects';
}
TransifexApi.register(Project, 'Project');

class ProjectWebhook extends JsonApiResource {
  static TYPE = 'project_webhooks';
}
TransifexApi.register(ProjectWebhook, 'ProjectWebhook');

class Resource extends JsonApiResource {
  static TYPE = 'resources';

  async purge() {
    let count = 0;
    /* eslint-disable no-restricted-syntax */
    for await (
      const page of this.constructor.API.ResourceString
        .filter({ resource: this })
        .allPages()
    ) {
      count += page.data.length;
      this.constructor.API.ResourceString.bulkDelete(page.data);
    }
    /* eslint-enable */
    return count;
  }

  async downloadSource(attributes = {}) {
    const actualAttributes = { ...attributes };
    if (!('file_type' in attributes)) {
      actualAttributes.file_type = 'default';
    }
    return this.constructor.API.ResourceStringsAsyncDownload.download({
      resource: this,
      ...actualAttributes,
    });
  }
}
TransifexApi.register(Resource, 'Resource');

class ResourceString extends JsonApiResource {
  static TYPE = 'resource_strings';
}
TransifexApi.register(ResourceString, 'ResourceString');

class ResourceStringsAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_strings_async_downloads';

  static async download(data) {
    return download.call(this, data);
  }
}
TransifexApi.register(ResourceStringsAsyncDownload, 'ResourceStringsAsyncDownload');

class ResourceStringsAsyncUpload extends JsonApiResource {
  static TYPE = 'resource_strings_async_uploads';
}
TransifexApi.register(ResourceStringsAsyncUpload, 'ResourceStringsAsyncUpload');

class ResourceStringComment extends JsonApiResource {
  static TYPE = 'resource_string_comments';
}
TransifexApi.register(ResourceStringComment, 'ResourceStringComment');

class I18nFormat extends JsonApiResource {
  static TYPE = 'i18n_formats';
}
TransifexApi.register(I18nFormat, 'I18nFormat');

class ContextScreenshotMap extends JsonApiResource {
  static TYPE = 'context_screenshot_maps';
}
TransifexApi.register(ContextScreenshotMap, 'ContextScreenshotMap');

class ContextScreenshot extends JsonApiResource {
  static TYPE = 'context_screenshots';
}
TransifexApi.register(ContextScreenshot, 'ContextScreenshot');

class OrganizationActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'organization_activity_reports_async_downloads';
}
TransifexApi.register(OrganizationActivityReportsAsyncDownload, 'OrganizationActivityReportsAsyncDownload');

class ProjectActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'project_activity_reports_async_downloads';
}
TransifexApi.register(ProjectActivityReportsAsyncDownload, 'ProjectActivityReportsAsyncDownload');

class ResourceActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_activity_reports_async_downloads';
}
TransifexApi.register(ResourceActivityReportsAsyncDownload, 'ResourceActivityReportsAsyncDownload');

class TeamActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'team_activity_reports_async_downloads';
}
TransifexApi.register(TeamActivityReportsAsyncDownload, 'TeamActivityReportsAsyncDownload');

class ResourceLanguageStat extends JsonApiResource {
  static TYPE = 'resource_language_stats';
}
TransifexApi.register(ResourceLanguageStat, 'ResourceLanguageStat');

class ResourceTranslation extends JsonApiResource {
  static TYPE = 'resource_translations';
}
TransifexApi.register(ResourceTranslation, 'ResourceTranslation');

class ResourceTranslationsAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_translations_async_downloads';
}
TransifexApi.register(ResourceTranslationsAsyncDownload, 'ResourceTranslationsAsyncDownload');

class ResourceTranslationsAsyncUpload extends JsonApiResource {
  static TYPE = 'resource_translations_async_uploads';
}
TransifexApi.register(ResourceTranslationsAsyncUpload, 'ResourceTranslationsAsyncUpload');

class TeamMembership extends JsonApiResource {
  static TYPE = 'team_memberships';
}
TransifexApi.register(TeamMembership, 'TeamMembership');

class Team extends JsonApiResource {
  static TYPE = 'teams';
}
TransifexApi.register(Team, 'Team');

class TmxAsyncDownload extends JsonApiResource {
  static TYPE = 'tmx_async_downloads';
}
TransifexApi.register(TmxAsyncDownload, 'TmxAsyncDownload');

class TmxAsyncUpload extends JsonApiResource {
  static TYPE = 'tmx_async_uploads';
}
TransifexApi.register(TmxAsyncUpload, 'TmxAsyncUpload');

class ResourceLanguageStats extends JsonApiResource {
  static TYPE = 'resource_language_stats';
}
TransifexApi.register(ResourceLanguageStats, 'ResourceLanguageStats');

class ResourceStringsRevision extends JsonApiResource {
  static TYPE = 'resource_strings_revisions';
}
TransifexApi.register(ResourceStringsRevision, 'ResourceStringsRevision');

export const transifexApi = new TransifexApi();
