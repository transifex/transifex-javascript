import _ from 'lodash'; /* eslint-disable-line max-classes-per-file */
import axios from 'axios';

import { isNull, isResource } from './utils';
import { JsonApiException } from './errors';
import Resource from './resources';

export default class JsonApi {
  /*  {json:api} connection **type** class. You need to subclass this to
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
    *   FamilyApi.register(Parent);
    *
    *   const familyApi = new FamilyApi({ auth: 'MYTOKEN' });
    *
    * After this, you can access the `Resouce` subclass and its methods on the
    * connection instance directly. You can use either the `Resource`
    * subclass's name or its TYPE static field:
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

  static register(parentCls) {
    function get() {
      const jsonApiInstance = this;
      let childCls = jsonApiInstance.registry[parentCls.TYPE];
      if (!childCls) {
        childCls = class extends parentCls {
          static API = jsonApiInstance;
        };
        jsonApiInstance.registry[parentCls.TYPE] = childCls;
      }
      return childCls;
    }
    Object.defineProperty(this.prototype, parentCls.name, { get });
    Object.defineProperty(this.prototype, parentCls.TYPE, { get });
  }

  async request({
    url,
    bulk = false,
    headers = {},
    maxRedirects = 0,
    ...props
  }) {
    /*  Perform an HTTP request to the server. Most of the parameters will be
      * filled in with sensible defaults for {json:api} interactons. The rest
      * will be forwarded to `axios.request()`. In case of error, an attempt
      * will be made to wrap the error in an error classes that make sense for
      * {json:api} responses. If this fails (because perhaps the error
      * originated in the load balancer sitting in front of the server), the
      * axios error will be thrown. */

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

  new({ type, ...props }) {
    /*  Return a new resource instance, using the appropriate Resource
      * subclass, provided that it has been registered with this API instance.
      */

    const jsonApiInstance = this;
    const cls = this.registry[type];
    if (!cls) {
      this.registry[type] = class extends Resource {
        static TYPE = type;

        static API = jsonApiInstance;
      };
    }
    return new this.registry[type](props);
  }

  asResource(value) {
    // Little convenience function when we don't know if we are dealing with a
    // Resource instance or a dict describing a relationship. Will use the
    // Appropriate Resource subclass.

    if (isNull(value) || isResource(value)) {
      return value;
    }
    let actualValue = value;
    if ('data' in value) {
      actualValue = value.data;
    }
    return this.new(actualValue);
  }

  static extend({ HOST, ...proto }) {
    /*  If you are using an environment that doesn't support classes, like an
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

    const cls = class extends this {
      static HOST = HOST;
    };
    Object.assign(cls.prototype, proto);
    return cls;
  }
}
