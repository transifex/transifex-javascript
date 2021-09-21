import _JsonApi from './apis';
import _Resource from './resources';

export {
  JsonApiException,
  NotSingleItem,
  DoesNotExist,
  MultipleObjectsReturned,
} from './errors';

export const JsonApi = _JsonApi;
export const Resource = _Resource;
