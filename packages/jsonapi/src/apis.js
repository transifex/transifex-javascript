import _ from 'lodash'; /* eslint-disable-line max-classes-per-file */
import axios from 'axios';

import { isNull, isResource } from './utils';
import { JsonApiException } from './errors';
import Resource from './resources';

export function validateStatus(status) {
  return status >= 200 && status < 400;
}

/**
  * {json:api} connection **type** class. You need to subclass this to
  * establish communication with a compatible server. Then, **before**
  * creating a connection **instance**, you need to register `Resource`
  * subclasses using the `.register()` static method:
  *
  *   class FamilyApi extends JsonApi {
  *     static HOST = 'https://api.families.com';
  *   }
  *
  *   class Parent extends Resource {...}
  *
  *   FamilyApi.register(Parent, 'Parent');
  *
  *   const familyApi = new FamilyApi({ auth: 'MYTOKEN' });
  *
  * After this, you can access the `Resouce` subclass and its methods on the
  * connection instance directly. You can use either the name you supplied as a
  * second argument to `.register()` or its TYPE static field:
  *
  *   const parent = await familyApi.Parent.get('1');
  *   const parent = await familyApi.parents.get('1');
  *
  * The constructor accepts the 'auth' and 'host' properties. You can
  * override the host in case you want to connect to a sandbox server. The
  * 'auth' property is either a string which will be sent as a
  * "Authorization: Bearer ${auth}" header. Otherwise, if it's a callable,
  * its return value will be merged with the headers that will be sent to the
  * server:
  *
  *   const familyApi = new FamilyApi({ auth: 'MYTOKEN' });
  *   // equivalent to
  *   const familyApi = new FamilyApi({
  *     auth: () => { return { Authorization: 'Bearer MYTOKEN' } }',
  *   });
  *
  * After initialization, you can modify the 'host' and 'auth' properties
  * using `.setup()`. In fact, the constructor and `.setup()` have been
  * written in such a way that the following two snippets are equivalent:
  *
  *   const props = ...;
  *   const familyApi = new FamilyApi(props);
  *
  *   // equivalent to
  *
  *   const props = ...;
  *   const familyApi = new FamilyApi();
  *   familyApi.setup(props);
  *
  * This way, yu can either expose the `JsonApi` subclass and let users
  * instanciate it or export a single global instance and expect users to set
  * it up, or both:
  *
  *   // familyApi.js
  *   export class FamilyApi extends JsonApi {...}
  *   export const familyApi = new FamilyApi();
  *
  *   // myapp.js
  *   import { familyApi, FamilyApi } from './familyApi.js';
  *   familyApi.setup({ auth: 'user1' });
  *   const customApi1 = new FamilyApi({ auth: 'user2' });
  *   const customApi2 = new FamilyApi({ auth: 'user2' }); */
export default class JsonApi {
  static registry = {};

  constructor(props = {}) {
    this.host = this.constructor.HOST;
    this.auth = null;
    this.registry = {};

    this.setup(props);
  }

  setup({ host, auth } = {}) {
    if (host) {
      this.host = host;
    }
    if (auth) {
      if (_.isFunction(auth)) {
        this.auth = auth;
      } else {
        this.auth = () => ({ Authorization: `Bearer ${auth}` });
      }
    }
  }

  static register(parentCls, name) {
    this.registry[parentCls.TYPE] = parentCls;
    const descriptor = {
      configurable: true,
      enumerable: true,
      get: function get() { return this.getCls(parentCls.TYPE); },
    };
    Object.defineProperty(this.prototype, name, descriptor);
    Object.defineProperty(this.prototype, parentCls.TYPE, descriptor);
  }

  getCls(type) {
    const jsonApiInstance = this;
    let childCls = jsonApiInstance.registry[type];
    if (!childCls) {
      const parentCls = jsonApiInstance.constructor.registry[type];
      if (parentCls) {
        childCls = class extends parentCls {
          static API = jsonApiInstance;
        };
      } else {
        childCls = class extends Resource {
          static TYPE = type;

          static API = jsonApiInstance;
        };
      }
      jsonApiInstance.registry[type] = childCls;
    }
    return childCls;
  }

  /**
    * Perform an HTTP request to the server. Most of the parameters will be
    * filled in with sensible defaults for {json:api} interactons. The rest
    * will be forwarded to `axios.request()`. In case of error, an attempt
    * will be made to wrap the error in an error classes that make sense for
    * {json:api} responses. If this fails (because perhaps the error
    * originated in the load balancer sitting in front of the server), the
    * axios error will be thrown. */
  async request({
    url,
    bulk = false,
    headers = {},
    maxRedirects = 0,
    ...props
  }) {
    let actualUrl = url;
    if (url[0] === '/') {
      actualUrl = this.host + url;
    }
    const actualHeaders = this.auth();
    if (bulk) {
      actualHeaders['Content-Type'] = (
        'application/vnd.api+json;profile="bulk"'
      );
    } else {
      actualHeaders['Content-Type'] = 'application/vnd.api+json';
    }
    Object.assign(actualHeaders, headers);
    let response;
    try {
      response = await axios.request({
        url: actualUrl,
        headers: actualHeaders,
        maxRedirects,
        validateStatus,
        ...props,
      });
    } catch (e) {
      const errors = _.get(e.response, 'data.errors');
      if (errors) {
        throw new JsonApiException(e.response.status, errors);
      } else {
        throw e;
      }
    }
    return response;
  }

  /**
    * Return a new resource instance, using the appropriate Resource
    * subclass, provided that it has been registered with this API instance.
    */
  new({ type, ...props }) {
    const Cls = this.getCls(type);
    return new Cls(props);
  }

  /**
    * Little convenience function when we don't know if we are dealing with a
    * Resource instance or a dict describing a relationship. Will use the
    * Appropriate Resource subclass.
    * */
  asResource(value) {
    if (isNull(value) || isResource(value)) {
      return value;
    }
    let actualValue = value;
    if ('data' in value) {
      actualValue = value.data;
    }
    return this.new(actualValue);
  }

  /**
    * If you are using an environment that doesn't support classes, like an
    * old browser, you can use this static method to create a subclass for
    * the connection type:
    *
    *   var FamilyApi = JsonApi.extend({
    *     HOST: 'https://api.families.com',
    *   });
    *
    *   // equivalent to
    *
    *   class FamilyApi extends JsonApi {
    *     static HOST = 'https://api.families.com';
    *   }
    * */
  static extend({ HOST, ...proto }) {
    const cls = class extends this {
      static HOST = HOST;
    };
    Object.assign(cls.prototype, proto);
    return cls;
  }
}
