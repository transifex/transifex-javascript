/* eslint-disable no-await-in-loop, max-classes-per-file */
import { JsonApi, Resource as JsonApiResource } from '@transifex/jsonapi';

function sleep(sec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  });
}

async function download({ interval = 5, ...data }) {
  // 'this' is a Resource subclass
  const resource = await this.create(data);
  while (!resource.redirect) {
    await sleep(interval);
    await resource.reload();
  }
  return resource.redirect;
}

async function upload({ interval = 5, ...data }) {
  const resource = await this.create(data);
  while (resource.get('status') !== 'succeeded') {
    await sleep(interval);
    await resource.reload();
  }
}

export class TransifexApi extends JsonApi {
  static HOST = 'https://rest.api.transifex.com';
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
      await this.constructor.API.ResourceString.bulkDelete(page.data);
    }
    /* eslint-enable */
    return count;
  }

  async downloadSource(attributes = {}) {
    return this.constructor.API.ResourceStringsAsyncDownload.download({
      resource: this,
      ...attributes,
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

  /**
   * Download source content
   *
   * @static
   * @param {object} data
   * @param {Resource} data.resource
   * @param {string} data.content_encoding - "text" (default) or "base64"
   * @param {string} data.file_type - "default" (default) or "xliff"
   * @param {boolean} data.pseudo - Generate mock string translations
   * @param {string} data.callback_url - The URL that will be called when processing is complete
   * @param {number} data.interval - Seconds to check status (5sec default)
   * @memberof ResourceStringsAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, {
      content_encoding: 'text',
      file_type: 'default',
      ...data,
    });
  }
}
TransifexApi.register(ResourceStringsAsyncDownload, 'ResourceStringsAsyncDownload');

class ResourceStringsAsyncUpload extends JsonApiResource {
  static TYPE = 'resource_strings_async_uploads';

  /**
   * Upload source content
   *
   * Content is always in string format. To upload a binary file, convert it to
   * Base64 and set the content_type='base64'.
   *
   * @static
   * @param {object} data
   * @param {Resource} data.resource
   * @param {string} data.content
   * @param {string} data.content_encoding - "text" (default) or "base64"
   * @param {string} data.callback_url - The URL that will be called when processing is complete
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof ResourceStringsAsyncUpload
   */
  static async upload(data) {
    return upload.call(this, { content_encoding: 'text', ...data });
  }
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

  /**
   * Download organization activity report
   *
   * @static
   * @param {object} data
   * @param {Organization} data.organization
   * @param {Language} data.language
   * @param {User} data.user
   * @param {string} data.date_from - Date, will be treated as UTC by the API
   * @param {string} data.date_to - Date, will be treated as UTC by the API
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof OrganizationActivityReportsAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, data);
  }
}
TransifexApi.register(OrganizationActivityReportsAsyncDownload, 'OrganizationActivityReportsAsyncDownload');

class ProjectActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'project_activity_reports_async_downloads';

  /**
   * Download project activity report
   *
   * @static
   * @param {object} data
   * @param {Project} data.project
   * @param {Language} data.language
   * @param {User} data.user
   * @param {string} data.date_from - Date, will be treated as UTC by the API
   * @param {string} data.date_to - Date, will be treated as UTC by the API
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof ProjectActivityReportsAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, data);
  }
}
TransifexApi.register(ProjectActivityReportsAsyncDownload, 'ProjectActivityReportsAsyncDownload');

class ResourceActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_activity_reports_async_downloads';

  /**
   * Download resource activity report
   *
   * @static
   * @param {object} data
   * @param {Resource} data.resource
   * @param {Language} data.language
   * @param {User} data.user
   * @param {string} data.date_from - Date, will be treated as UTC by the API
   * @param {string} data.date_to - Date, will be treated as UTC by the API
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof ResourceActivityReportsAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, data);
  }
}
TransifexApi.register(ResourceActivityReportsAsyncDownload, 'ResourceActivityReportsAsyncDownload');

class TeamActivityReportsAsyncDownload extends JsonApiResource {
  static TYPE = 'team_activity_reports_async_downloads';

  /**
   * Download team activity report
   *
   * @static
   * @param {object} data
   * @param {Team} data.team
   * @param {Language} data.language
   * @param {User} data.user
   * @param {string} data.date_from - Date, will be treated as UTC by the API
   * @param {string} data.date_to - Date, will be treated as UTC by the API
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof TeamActivityReportsAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, data);
  }
}
TransifexApi.register(TeamActivityReportsAsyncDownload, 'TeamActivityReportsAsyncDownload');

class ResourceLanguageStats extends JsonApiResource {
  static TYPE = 'resource_language_stats';
}
TransifexApi.register(ResourceLanguageStats, 'ResourceLanguageStats');

class ResourceTranslation extends JsonApiResource {
  static TYPE = 'resource_translations';
}
TransifexApi.register(ResourceTranslation, 'ResourceTranslation');

class ResourceTranslationsAsyncDownload extends JsonApiResource {
  static TYPE = 'resource_translations_async_downloads';

  /**
   * Download translation file
   *
   * @static
   * @param {object} data
   * @param {Resource} data.resource
   * @param {Language} data.language
   * @param {string} data.content_encoding - "text" (default) or "base64"
   * @param {string} data.file_type - "default" (default) or "xliff"
   * @param {string} data.mode - "default" (default), "reviewed", "proofread",
   *   "translator", "untranslated", "onlytranslated", "onlyreviewed",
   *   "onlyproofread", "sourceastranslation"
   * @param {string} data.callback_url - The URL that will be called when processing is complete
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof ResourceTranslationsAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, {
      content_encoding: 'text',
      file_type: 'default',
      mode: 'default',
      ...data,
    });
  }
}
TransifexApi.register(ResourceTranslationsAsyncDownload, 'ResourceTranslationsAsyncDownload');

class ResourceTranslationsAsyncUpload extends JsonApiResource {
  static TYPE = 'resource_translations_async_uploads';

  /**
   * Upload translations.
   *
   * Content is always in string format. To upload a binary file, convert it to
   * Base64 and set the content_type='base64'.
   *
   * @static
   * @param {object} data
   * @param {Resource} data.resource
   * @param {Language} data.language
   * @param {string} data.content
   * @param {string} data.content_encoding - "text" (default) or "base64"
   * @param {string} file_type - "default" (default) or "xliff"
   * @param {string} data.callback_url - The URL that will be called when processing is complete
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof ResourceTranslationsAsyncUpload
   */
  static async upload(data) {
    return upload.call(this, {
      content_encoding: 'text',
      file_type: 'default',
      ...data,
    });
  }
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

  /**
   * Export project's TM as a TMX file
   *
   * @static
   * @param {object} data
   * @param {Project} data.project
   * @param {Language} data.language
   * @param {string} data.callback_url - The URL that will be called when processing is complete
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof TmxAsyncDownload
   * @returns - A URL to download the content
   */
  static async download(data) {
    return download.call(this, { callback_url: null, ...data });
  }
}
TransifexApi.register(TmxAsyncDownload, 'TmxAsyncDownload');

class TmxAsyncUpload extends JsonApiResource {
  static TYPE = 'tmx_async_uploads';

  /**
   * Upload a TMX file
   *
   * Content is always in string format. To upload a binary file, convert it to
   * Base64 and set the content_type='base64'.
   *
   * @static
   * @param {object} data
   * @param {Project} data.project
   * @param {Language} data.language
   * @param {string} data.content
   * @param {string} data.content_encoding - "text" (default) or "base64"
   * @param {boolean} data.override - Whether to override the TM
   * @param {string} data.callback_url - The URL that will be called when processing is complete
   * @param {number} data.interval - seconds to check status (5sec default)
   * @memberof TmxAsyncUpload
   */
  static async upload(data) {
    return upload.call(this, { content_encoding: 'text', ...data });
  }
}
TransifexApi.register(TmxAsyncUpload, 'TmxAsyncUpload');

class ResourceStringsRevision extends JsonApiResource {
  static TYPE = 'resource_strings_revisions';
}
TransifexApi.register(ResourceStringsRevision, 'ResourceStringsRevision');

export const transifexApi = new TransifexApi();
