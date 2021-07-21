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
 * @returns {Number} Data.count
 * @returns {Number} Data.status
 * @returns {Number} Data.token
 */
async function invalidateCDS(params) {
  const action = params.purge ? 'purge' : 'invalidate';
  const res = await axios.post(`${params.url}/${action}`, {
  }, {
    headers: {
      Authorization: `Bearer ${params.token}:${params.secret}`,
      'Accept-version': 'v2',
      'Content-Type': 'application/json;charset=utf-8',
      'X-NATIVE-SDK': `txjs/cli/${version}`,
    },
  });
  return res.data;
}

module.exports = {
  invalidateCDS,
};
