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
 * @returns {Boolean} Data.success
 * @returns {String} Data.status
 * @returns {Object} Data.data
 * @returns {Number} Data.data.created
 * @returns {Number} Data.data.updated
 * @returns {Number} Data.data.skipped
 * @returns {Number} Data.data.deleted
 * @returns {Number} Data.data.failed
 * @returns {String[]} Data.data.errors
 */
async function uploadPhrases(payload, params) {
  try {
    const res = await axios.post(`${params.url}/content`, {
      data: payload,
      meta: {
        purge: !!params.purge,
      },
    }, {
      headers: {
        Authorization: `Bearer ${params.token}:${params.secret}`,
        'Content-Type': 'application/json;charset=utf-8',
        'X-NATIVE-SDK': `txjs/cli/${version}`,
      },
    });
    return {
      success: true,
      status: res.status,
      data: res.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        data: error.response.data,
      };
    }
    throw new Error(error.message);
  }
}

module.exports = uploadPhrases;
