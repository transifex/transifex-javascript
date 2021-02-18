const axios = require('axios');
const { version } = require('../../package.json');

/**
 * Invalidate CDS cache
 *
 * @param {Object} params
 * @param {String} params.url
 * @param {String} params.token
 * @param {String} params.secret
 * @param {Boolean} params.purge
 * @returns {Object} Data
 * @returns {Boolean} Data.success
 * @returns {String} Data.status
 * @returns {Number} Data.data.count
 * @returns {Number} Data.data.status
 * @returns {Number} Data.data.token
 */
async function invalidateCDS(params) {
  const action = params.purge ? 'purge' : 'invalidate';
  try {
    const res = await axios.post(`${params.url}/${action}`, {
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

module.exports = invalidateCDS;
