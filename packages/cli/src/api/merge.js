/* eslint no-param-reassign: 0 */

const _ = require('lodash');
const { mergeArrays } = require('./utils');

/**
 * Merge child hash payload to parent.
 * Payload is of type:
 * {
 *    key: {
 *      string: <String>,
 *      meta: {
 *        context: <Array>
 *        developer_comment: <String>
 *        character_limit: <Number>,
 *        tags: <String>,
 *        occurrences: <Array>,
 *      },
 *    },
 *    ...
 * }
 *
 * @param {Object} parent
 * @param {Object} child
 */
function mergePayload(parent, child) {
  _.each(child, (value, key) => {
    if (!parent[key]) {
      parent[key] = value;
      return;
    }

    if (!value.meta) return;
    if (!parent[key].meta) {
      parent[key].meta = {};
    }

    const parentMeta = parent[key].meta;
    const childMeta = value.meta;

    _.each(['developer_comment', 'character_limit'], (field) => {
      if (_.isUndefined(childMeta[field])) return;
      parentMeta[field] = childMeta[field];
    });

    _.each(['tags', 'occurrences'], (field) => {
      if (_.isUndefined(childMeta[field])) return;
      parentMeta[field] = mergeArrays(parentMeta[field], childMeta[field]);
    });
  });
  return parent;
}

module.exports = mergePayload;
