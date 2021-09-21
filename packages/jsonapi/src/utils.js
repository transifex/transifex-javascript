import _ from 'lodash';

import { Collection } from './collections';
import { Resource } from './resources';

export function hasData(value) {
  return _.isObject(value) && 'data' in value;
}

export function hasLinks(value) {
  return _.isObject(value) && 'links' in value;
}

export function isSingularFetched(value) {
  return (! isNull(value) &&
          value instanceof Resource &&
          (_.size(value.attributes) > 0 || _.size(value.relationships) > 0));
}

export function isPluralFetched(value) {
  return (! isNull(value) &&
          value instanceof Collection);
}

export function isList(value) {
  return _.isArray(value);
}

export function isNull(value) {
  return ! value;
}

export function isObject(value) {
  return _.isPlainObject(value);
}

export function isResource(value) {
  return value instanceof Resource;
}

export function isResourceIdentifier(value) {
  return _.isObject(value) && 'type' in value && 'id' in value;
}
