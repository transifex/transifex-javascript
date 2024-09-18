import _ from 'lodash';

import Collection from './collections'; /* eslint-disable-line import/no-cycle */
import Resource from './resources'; /* eslint-disable-line import/no-cycle */

export function hasData(value) {
  return _.isPlainObject(value) && 'data' in value;
}

export function hasLinks(value) {
  return _.isPlainObject(value) && 'links' in value;
}

export function isResource(value) {
  return value instanceof Resource;
}

export function isSingularFetched(value) {
  return (value
          && isResource(value)
          && (_.size(value.attributes) > 0 || _.size(value.relationships) > 0));
}

export function isPluralFetched(value) {
  return value && value instanceof Collection;
}

export function isCollection(value) {
  return value instanceof Collection;
}

export function isResourceIdentifier(value) {
  return _.isPlainObject(value) && 'type' in value && 'id' in value;
}
