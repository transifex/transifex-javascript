import _ from 'lodash';

import { DoesNotExist, MultipleObjectsReturned } from './errors';
import { hasData, isNull } from './utils';
import { Resource } from './resources';

export class Collection {
  /*  A class for holding responses to collection URLs (eg '/parents'). You
    * will not have to instanciate this class yourself, but you can create
    * instances from `Resource`'s static methods:
    *
    *   const children = familyApi.Child.list();
    *   await children.fetch();
    *   console.log(children.data[0].get('name'));
    *
    *   // or
    *
    *   const parent = await familyApi.Parent.get('1');
    *   const children = await parent.fetch('children');
    *   await children.fetch();
    *   console.log(children.data[0].get('name'));
    *
    * You need to await a call to `.fetch()` before you can access the data of
    * the response. This is because the collection instances are lazy. You can
    * create modified copies of them for filtering purposes and await the final
    * result. No interaction with the server will be made before `.fetch()` is
    * called:
    *
    *   let children = familyApi.Child.list();
    *   children = children.filter({ age__gt: 12 });
    *   await children.fetch();
    *   console.log(children.data[0].get('name'));
    *
    * After `.fetch()`, the 'data' will only hold the first page of the results
    * (assuming the server supports pagination). To get the rest, you need to
    * use the pagination methods (see below). */

  constructor(API, url, params = null) {
    this._API = API;
    this._url = url;
    this._params = params;
    this.data = null;
    this.next = this.previous = null;
  }

  async fetch() {
    if (! isNull(this.data)) {
      return;
    }

    const response = await this._API.request({
      method: 'get',
      url: this._url,
      params: this._params,
    });

    const includedMap = {};
    if ('included' in response.data) {
      for (const includedItem of response.data.included) {
        const key = `${includedItem.type}__${includedItem.id}`;
        includedMap[key] = includedItem;
      }
    }

    this.data = [];
    for (const item of response.data.data) {
      const related = {};
      for (const name in (item.relationships || {})) {
        const relationship = item.relationships[name];
        if (isNull(relationship) || ! hasData(relationship)) {
          continue;
        }
        const key = `${relationship.data.type}__${relationship.data.id}`;
        if (key in includedMap) {
          related[name] = this._API.new(includedMap[key]);
        }
      }
      const relationships = item.relationships || {};
      delete item.relationships;
      Object.assign(relationships, related);
      this.data.push(this._API.new({ relationships, ...item }));
    }

    this.next = (response.data.links || {}).next || null;
    this.previous = (response.data.links || {}).previous || null;
  }

  static fromData(API, data, url = '') {
    const result = new this(API, url);
    result.data = data;
    return result;
  }

  async getNext() {
    /*  Return a new `Collection` instance for the next page of the resuts and
      * await it. This will only work if the `.next` field is set:
      *
      *   const allChildren = [];
      *   let children = familyApi.Child.list();
      *   await children.fetch();
      *   while (true) {
      *     for (const child in children.data) {
      *       allChildren.push(child);
      *     }
      *     if (! children.next) {
      *       break;
      *     }
      *       children = await children.getNext();
      *   }
      * */

    const page = new this.constructor(this._API, this.next);
    await page.fetch();
    return page;
  }

  async getPrevious() {
    // Similar to `.getNext()`, but for the previous page
    //
    const page = new this.constructor(this._API, this.previous);
    await page.fetch();
    return page;
  }

  extra(params) {
    /*  Add custom GET parameters to the request, before fetching the
      * collection. This returns a modified copy of the original collection:
      *
      *   const children = familyApi.Child.list().extra({ foo: 'bar' });
      *   await children.fetch();
      *
      * This will send:
      *
      *   GET /children?foo=bar
      * */

    const newParams = { ...this._params || {}, ...params };
    return new this.constructor(this._API, this._url, newParams);
  }

  filter(filters) {
    /*  Add filters to the request's GET parameters. This will use {json:api}'s
      * `filter[FIELD]` syntax. So:
      *
      *   const children = familyApi.Child.filter({ age: 15 });
      *
      * will send:
      *
      *   GET /children?filter[age]=15
      *
      * If the filter keys contain '__', then the filter parameters will be
      * nested, Django-style:
      *
      *   const children = familyApi.Child.filter({ age__gt: 15 });
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?filter[age][gt]=15
      *
      * Because it is a common use-case, if the filter values are `Resource`
      * instances, their ID will be used:
      *
      *   const parent = await familyApi.Parent.get('1');
      *   const children = familyApi.Child.filter({ parent: parent });
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?filter[parent]=1
      * */

    const params = {};
    for (const key in filters) {
      let value = filters[key];
      const parts = key.split('__');
      const filterKey = [ `filter[${parts[0]}]` ];
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        filterKey.push(`[${part}]`);
      }
      if (value instanceof Resource) {
        value = value.id;
      }
      params[filterKey.join('')] = value;
    }
    return this.extra(params);
  }

  page(arg) {
    /* This will apply pagination, by specifying the 'page' GET parameter. You
      * will normally not have to use this manually since {json:api} response
      * contain pagination links that can be accessed with other methods. If a
      * single argument is provided, it will be used as the value of the 'page'
      * GET parameter. If an object is provided, its values will be applied as
      * 'page[FIELD]' GET paramters, similar to filters:
      *
      *   const children = familyApi.Child.page('3');
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?page=3
      *
      * while
      *
      *   const children = familyApi.Child.page({ cursor: 'XXX' });
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?page[cursor]=XXX
      * */

    let params = {};
    if (_.isPlainObject(arg)) {
      for (const key in arg) {
        const value = arg[key];
        params[`page[${key}]`] = value;
      }
    }
    else {
      params.page = arg;
    }
    return this.extra(params);
  }

  include(...args) {
    /*  Will set the 'include' GET parameter. The arguments will be
      * comma-separated:
      *
      *   const children = familyApi.Child.include('parent', 'pets');
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?include=parent,pets
      * */

    return this.extra({ include: args.join(',') });
  }

  sort(...args) {
    /*  Will set the 'sort' GET parameter. The arguments will be
      * comma-separated:
      *
      *   const children = familyApi.Child.sort('name', 'age');
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?sort=name,age
      * */

    return this.extra({ sort: args.join(',') });
  }

  fields(...args) {
    /*  Will set the 'fields' GET parameter. The arguments will be
      * comma-separated:
      *
      *   const children = familyApi.Child.fields('name', 'age');
      *   await children.fetch();
      *
      * will send:
      *
      *   GET /children?fields=name,age
      * */

    return this.extra({ fields: args.join(',') });
  }

  async get(filters = {}) {
    /*  Applies all the filters, fetches the response and if the length of the
      * response is 1, returns it. If it's not 1, an appropriate error will be
      * thrown.
      * */

    const qs = this.filter(filters);
    await qs.fetch();
    if (qs.data.length === 0) {
      throw new DoesNotExist();
    }
    else if (qs.data.length > 1) {
      throw new MultipleObjectsReturned(qs.data.length);
    }
    else {
      return qs.data[0];
    }
  }

  async * allPages() {
    /*  Async generator that returns all the pages of a paginated response:
      *
      *   const children = familyApi.Child.list();
      *   const allChildren = [];
      *   for await (const page of children.allPages()) {
      *     allChildren.concat(page.data);
      *   }
      * */

    await this.fetch();
    let page = this;
    while (true) {
      yield page;
      if (page.next) {
        page = await page.getNext();
      }
      else {
        break;
      }
    }
  }

  async * all() {
    /*  Async generator that returns all the items of a paginated response:
      *
      *   const children = familyApi.Child.list();
      *   const allChildren = [];
      *   for await (const child of children.all()) {
      *     allChildren.push(child);
      *   }
      * */

    for await (const page of this.allPages()) {
      for (const item of page.data) {
        yield item;
      }
    }
  }
}
