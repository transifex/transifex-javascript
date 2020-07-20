const axios = require('axios');

/**
 * Push content to CDS
 *
 * @param {Object} payload
 * @param {Object} params
 * {
 *   url: <String>,
 *   token: <String>,
 *   secret: <String>,
 *   purge: <Boolean>
 * }
 * @returns {Object}
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
