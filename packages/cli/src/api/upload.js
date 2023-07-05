const axios = require('axios');
const { version } = require('../../package.json');

/**
 * Push content to CDS
 *
 * @param {Object} payload
 * @param {Object} params
 * @param {String} params.url
 * @param {String} params.token
 * @param {String} params.secret
 * @param {Boolean} params.purge
 * @returns {Object} Data
 * @returns {String} Data.jobUrl
 */
async function uploadPhrases(payload, params) {
  const res = await axios.post(`${params.url}/content`, {
    data: payload,
    meta: {
      purge: !!params.purge,
      dry_run: !!params.dry_run,
      keep_translations: !params.do_not_keep_translations,
      override_tags: !!params.override_tags,
      override_occurrences: !!params.override_occurrences,
    },
  }, {
    headers: {
      Authorization: `Bearer ${params.token}:${params.secret}`,
      'Accept-version': 'v2',
      'Content-Type': 'application/json;charset=utf-8',
      'X-NATIVE-SDK': `txjs/cli/${version}`,
    },
  });
  return {
    jobUrl: res.data.data.links.job,
  };
}

/**
 * Poll upload status
 *
 * @param {Object} params
 * @param {String} params.url
 * @param {String} params.token
 * @param {String} params.secret
 * @returns {Object} Data
 * @returns {Number} Data.created
 * @returns {Number} Data.updated
 * @returns {Number} Data.skipped
 * @returns {Number} Data.deleted
 * @returns {Number} Data.failed
 * @returns {String[]} Data.errors
 * @returns {String} Data.status
 */
async function pollJob(params) {
  const res = await axios.get(params.url, {
    headers: {
      Authorization: `Bearer ${params.token}:${params.secret}`,
      'Accept-version': 'v2',
      'Content-Type': 'application/json;charset=utf-8',
      'X-NATIVE-SDK': `txjs/cli/${version}`,
    },
  });
  const { data } = res.data;
  return {
    ...(data.details || {}),
    errors: data.errors || [],
    status: data.status,
  };
}

module.exports = {
  uploadPhrases,
  pollJob,
};
