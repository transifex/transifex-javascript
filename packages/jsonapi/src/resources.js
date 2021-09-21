import _ from 'lodash'; /* eslint-disable-line max-classes-per-file */
import axios from 'axios';

import { /* eslint-disable-line import/no-cycle */
  hasData,
  hasLinks,
  isList,
  isNull,
  isObject,
  isPluralFetched,
  isResource,
  isResourceIdentifier,
  isSingularFetched,
} from './utils';
import Collection from './collections'; /* eslint-disable-line import/no-cycle */

export default class Resource {
  /*  Subclass like this:
    *
    *     class Parent extends Resource {
    *       static name = 'Parent';
    *       static TYPE = 'parents';
    *     }
    *
    * - 'TYPE' is needed to map this resource to the proper URLs and map API
    *   responses to the proper registered classes
    * - 'name' is also needed in case your code gets minified because
    *   registering the Resource subclass to an 'API connection type' depends
    *   on the '.name' attribute of the class to be reliable.
    *
    * To register a Resource subclass to an API connection type, do this:
    *
    *     class FamilyApi extends Jsonapi {
    *       static HOST = 'https://api.families.com';
    *     }
    *     class Parent extends Resource {
    *       // ...
    *     }
    *     FamilyApi.register();
    */

  constructor(data = {}) {
    this._overwrite(data);
  }

  _overwrite({
    id = null,
    attributes = {},
    relationships = {},
    links = {},
    redirect = null,
    type = null,
    included = [],
    ...props
  }) {
    /*  Write to the basic attributes of the resource. The input should
      * resemble the body of the 'data' field of an {json:api} response. Used
      * by the constructor, 'reload' and 'save'.
      *
      * Apart from properties that resemble a {json:api} response, you can use
      * any key-value pair. Values that look like relationships will be
      * interpreted as such while everything else will be interpreted as an
      * attribute:
      *
      *     new Child({
      *       attributes: { name: 'Hercules' },
      *       relationships: {
      *         parent: { data: { type: 'parents', id: '2' } },
      *       },
      *     });
      *
      *     // is equivalent to
      *
      *     new Child({
      *       name: 'Hercules',
      *       parent: { data: { type: 'parents', id: '2' } },
      *     });
      *
      * Also, for relationships you can use other Resource objects:
      *
      *     const parent = new api.Parent({ id: '2' });
      *     new Child({ name: 'Hercules', parent });
      */

    if (type && type !== this.constructor.TYPE) {
      throw new Error(
        `Received type '${type}', expected ${this.constructor.TYPE}`,
      );
    }

    const actualAttributes = attributes;
    const actualRelationships = relationships;

    Object.entries(props).forEach(([key, value]) => {
      if (
        // Parent: { type: 'parents', id: '1' }
        isResourceIdentifier(value)

        // Parent: new Parent({ id: '1' })
        || isResource(value)

        || (isObject(value) && (

          // Parent: { links: { related: 'related' } }
          hasLinks(value)

          || (hasData(value) && (

            // Parent: { data: { type: 'parents', id: '1' } }
            isResourceIdentifier(value.data)

            // Parent: { data: new Parent({ id: '1' }) }
            || isResource(value.data)

            // Children: { data: [{ type: 'children', id: '1' },
            //                    New Child({ id: '1' })] }
            || _.every(value.data, (item) => (
              isResourceIdentifier(item) || isResource(item)
            ))
          ))
        ))

        // Children: [{ type: 'children', id: '1' }, new Child({ id: '1' })]
        || (isList(value) && value.length > 0 && _.every(value, (item) => (
          isResourceIdentifier(item)
          || isResource(item)
        )))
      ) {
        actualRelationships[key] = value;
      } else {
        actualAttributes[key] = value;
      }
    });

    this.id = id;
    this.attributes = actualAttributes;
    this.links = links;
    this.redirect = redirect;

    this.relationships = _.pickBy(
      this.relationships,
      (value, key) => key in actualRelationships,
    );
    this.related = _.pickBy(
      this.related,
      (value, key) => key in actualRelationships,
    );
    const includedMap = {};
    included.forEach((includedItem) => {
      const key = `${includedItem.type}__${includedItem.id}`;
      includedMap[key] = this.constructor.API.asResource(includedItem);
    });
    Object.entries(actualRelationships).forEach(([key, value]) => {
      this._setRelated(key, value, includedMap);
    });
  }

  _setRelated(relationshipName, value, includedMap = null) {
    let actualValue = value;
    let actualIncludedMap = includedMap;
    if (!actualIncludedMap) {
      actualIncludedMap = {};
    }
    if (!actualValue) {
      this.relationships[relationshipName] = null;
      this.related[relationshipName] = null;
    } else if (
      isList(actualValue)
      || (isObject(actualValue) && isList(actualValue.data))
      || (isObject(actualValue) && hasLinks(actualValue) && !hasData(actualValue))
    ) {
      this.relationships[relationshipName] = {};
      const relationship = this.relationships[relationshipName];
      if (isObject(actualValue) && hasLinks(actualValue)) {
        relationship.links = actualValue.links;
      }
      if (hasData(actualValue)) {
        actualValue = actualValue.data;
      }
      if (isList(actualValue)) {
        const datas = [];
        const resources = [];
        actualValue.forEach((item) => {
          const resource = this.constructor.API.asResource(item);
          const data = resource.asResourceIdentifier();
          datas.push(data);
          const key = `${data.type}__${data.id}`;
          if (key in actualIncludedMap) {
            resources.push(actualIncludedMap[key]);
          } else {
            resources.push(resource);
          }
        });

        relationship.data = datas;
        let url = null;
        if ('links' in relationship && 'related' in relationship.links) {
          url = relationship.links.related;
        }

        if (
          !this.related[relationshipName]
          || !this.related[relationshipName].data
          || this.related[relationshipName].data.length !== resources.length
          || _.some(
            _.zip(this.related[relationshipName].data, resources),
            ([previous, next]) => (
              previous.id !== next.id
              || _.size(next.attributes) > 0
              || _.size(next.relationships) > 0
            ),
          )
        ) {
          this.related[relationshipName] = Collection.fromData(
            this.constructor.API, resources, url,
          );
        }
      }
    } else {
      let resource;
      let data;
      let links = null;
      if (isObject(actualValue)) {
        if (hasData(actualValue)) {
          data = actualValue.data;
          if ('links' in actualValue) {
            links = actualValue.links;
          }
        } else {
          data = actualValue;
        }
        resource = this.constructor.API.new(data);
      } else if (isResource(actualValue)) {
        resource = actualValue;
        data = resource.asResourceIdentifier();
      } else {
        throw new Error(`Cannot set relationship '${relationshipName}'`);
      }
      const key = `${data.type}__${data.id}`;
      if (key in actualIncludedMap) {
        resource = actualIncludedMap[key];
      }

      this.relationships[relationshipName] = { data };
      if (links) {
        this.relationships[relationshipName].links = links;
      }

      if (
        (this.related[relationshipName] || {}).id !== resource.id
        || _.size(resource.attributes) > 0
        || _.size(resource.relationships) > 0
      ) {
        this.related[relationshipName] = resource;
      }
    }
  }

  get(key) {
    /*  Preferred way to get attributes and relationships:
      *
      *   child.get('name');
      *   // equivalent to
      *   child.attributes.name
      *
      *   child.get('parents');
      *   // equivalent to
      *   child.related.parents;
      * */

    if (key in this.related) {
      return this.related[key];
    }
    return this.attributes[key];
  }

  set(key, value) {
    /*  Preferred way to set attributes and relationsihps:
      *
      *   child.set('name', 'Bill');
      *   // equivalent to
      *   child.attribute.name = 'Bill'
      *
      *   child.set('parent', parent);
      *   // equivalent to
      *   child.related.parent = parent;
      *   child.relationships.parent = parent.asRelationship();
      * */

    if (key in this.relationships) {
      this._setRelated(key, value);
      this.relationships[key] = this.related[key].asRelationship();
    } else {
      this.attributes[key] = value;
    }
  }

  async reload(include = null) {
    // Fetch fresh data from the server for the object.

    const response = await this.constructor.API.request({
      method: 'get',
      url: this.getItemUrl(),
      params: include ? { include: include.join(',') } : null,
    });
    if (
      response.status >= 300
      && response.status < 400
      && response.headers.Location
    ) {
      this._overwrite({
        id: this.id,
        attributes: this.attributes,
        relationships: { ...this.relationships, ...this.related },
        links: this.links,
        redirect: response.headers.Location,
      });
      return;
    }
    const body = response.data;
    const { data } = body;
    if ('included' in body) {
      data.included = body.included;
    }
    this._overwrite(data);
  }

  static async get(arg = null, { include = null } = {}) {
    /*  Get an item by its id:
      *
      *   const child = await familyApi.Child.get('1');
      *
      * If the argument is an object, this will be equivalent to caling
      * `.get(...)` on `.list()`s output:
      *
      *   const child = await familyApi.Child.get({ name: 'Bill' });
      *   // equivalent to
      *   const child = await familyApi.Child.list().get({ name: 'Bill' });
      *
      * If you supply an object with the 'include' property as the second
      * argument, it will be supplied as a GET parameter:
      *
      *   const child = await familyApi.Child.get('1',
      *                                           { include: ['parent'] });
      *
      * will send
      *
      *   GET /children/1?include=parent
      *
      * and
      *
      *   const child = await familyApi.Child.get({ name: 'Bill' },
      *                                           { include: ['parent'] });
      *
      * will send
      *
      *   GET /children?filter[name]=Bill&include=parent
      * */

    if (arg === null || _.isPlainObject(arg)) {
      let result = this.list();
      if (include) {
        result = result.include(...include);
      }
      return result.get(arg || {});
    }
    const instance = new this({ id: arg });
    await instance.reload(include);
    return instance;
  }

  async fetch(relationshipName, force = false) {
    /*  Fetches and returns a relationship, if it wasn't included during
      * construction. If the relationship was previously fetched, it will skip
      * the interaction with the server, unless force is set to true.
      *
      * After fetching, you can access the relationship via the 'related'
      * attribute, but since this behaves lazily without 'force = true', you
      * are advised to reuse 'fetch'.
      * */

    if (!(relationshipName in this.relationships)) {
      throw new Error(
        `Resource does not have relationship '${relationshipName}'`,
      );
    }
    const relationship = this.relationships[relationshipName];
    if (isNull(relationship)) {
      return null;
    }
    const related = this.related[relationshipName];
    if ((isSingularFetched(related) || isPluralFetched(related)) && !force) {
      return related;
    }
    if (_.isObject(relationship.data)) {
      await related.reload();
      return related;
    }
    const url = (relationship.links || {}).related;
    if (!url) {
      throw new Error(`Cannot fetch ${relationshipName}, no 'related' link`);
    }
    this.related[relationshipName] = new Collection(
      this.constructor.API,
      url,
    );
    return this.related[relationshipName];
  }

  async save(firstArg = null, secondArg = null) {
    /*  Save the resource to the server. If the resource has no 'id', a POST
      * request will be saved, otherwise a PATCH request will. The resource's
      * fields will then be populated by the server's response, including a
      * server-generated 'id' if a POST request was made.
      *
      * - The first argument, if present, lists the resource's fields that will
      *   be sent.
      * - The last argument, if present, should be an object with key-value
      *   pairs that will be set on the resource right before saving.
      * - If no fields are specified by either argument, all the fields in
      *   'this.attributes' and 'this.relationships' will be sent
      *
      *     const parent = new api.Parent({ name: 'Zeus' });
      *     await parent.save();
      *
      *     parent.set('age', 54);
      *     await parent.save(['age']);
      *     // or
      *     await parent.save({ age: 54 });
      */
    let fields = [];
    let props = {};
    if (firstArg && secondArg) {
      fields = firstArg;
      props = secondArg;
    } else if (firstArg) {
      if (_.isArray(firstArg)) {
        fields = firstArg;
      } else if (_.isObject(firstArg)) {
        props = firstArg;
      }
    }

    Object.entries(props).forEach(([field, value]) => {
      this.set(field, value);
      fields.push(field);
    });

    if (this.id) {
      await this._saveExisting(fields);
    } else {
      await this._saveNew(fields);
    }
  }

  async _saveExisting(fields = []) {
    if (fields.length === 0) {
      Object.keys(this.attribute).forEach((field) => {
        fields.push(field);
      });
      Object.keys(this.related).forEach((field) => {
        fields.push(field);
      });
    }

    const data = {
      ...this.asResourceIdentifier(),
      ...this._generateDataForSaving(fields),
    };
    const response = await this.constructor.API.request({
      method: 'patch',
      url: this.getItemUrl(),
      data: { data },
    });
    this._postSave(response);
  }

  async _saveNew(fields = []) {
    if (fields.length === 0) {
      Object.keys(this.attributes).forEach((field) => {
        fields.push(field);
      });
      Object.keys(this.related).forEach((field) => {
        fields.push(field);
      });
    }

    const data = { type: this.constructor.TYPE };
    if (this.id) {
      data.id = this.id;
    }
    Object.assign(data, this._generateDataForSaving(fields));
    const response = await this.constructor.API.request({
      method: 'post',
      url: this.constructor.getCollectionUrl(),
      data: { data },
    });
    this._postSave(response);
  }

  _generateDataForSaving(fields) {
    const result = {};
    fields.forEach((field) => {
      if (field in this.attributes) {
        if (!('attributes' in result)) {
          result.attributes = {};
        }
        result.attributes[field] = this.attributes[field];
      } else if (field in this.relationships) {
        if (!('relationships' in result)) {
          result.relationships = {};
        }
        result.relationships[field] = this.constructor.API.asResource(
          this.relationships[field],
        ).asRelationship();
      } else {
        throw new Error(`Unknown field '${field}'`);
      }
    });
    return result;
  }

  _postSave(response) {
    const { data } = response.data;
    const related = { ...this.related };
    Object.entries(related).forEach(([relationshipName, relatedInstance]) => {
      const oldId = relatedInstance.id;
      const newId = data.relationships[relationshipName].data.id;
      if (oldId !== newId) {
        if (newId) {
          related[relationshipName] = this.constructor.API.new(
            data.relationships[relationshipName],
          );
        } else {
          delete related[relationshipName];
        }
      }
    });
    const relationships = data.relationships || {};
    delete data.relationships;
    Object.assign(relationships, related);
    this._overwrite({ relationships, ...data });
  }

  static async create(...args) {
    /*  Create and return a new resource. It is basically a shortcut for
      * creating a new object and calling 'save' on it straightaway:
      *
      *     const parent = new api.Parent({ name: 'Zeus' });
      *     await parent.save();
      *     // mostly equivalent to
      *     const parent = await api.Parent.create({ name: 'Zeus' });
      *
      * The only difference is that 'create' will *always* send a POST request,
      * so it is your only option to set a client-generated-ID:
      *
      *     // will send a POST request even though 'id' is set
      *     const parent = await api.Parent.create({ id: '1', name: 'Zeus' });
      */
    const instance = new this(...args);
    await instance._saveNew();
    return instance;
  }

  async delete() {
    /*  Deletes a resource from the API. After deletion, all the attributes and
      * relationships will remain but the 'id' will be set to null. This way
      * you can re-create the resource with the same fields or a subset:
      *
      *     await parent.delete();
      *     await parent.save(['name']);
      * */

    await this.constructor.API.request({
      method: 'delete',
      url: this.getItemUrl(),
    });
    this.id = null;
  }

  async change(field, value) {
    /*  Change a singular relationship. This will send a resource identifier to
      * the relationship's link. The link is saved in
      * `this.relationships[field].links.self` but it defaults to
      * `/${TYPE}/${this.id}/relationships/${field}`:
      *
      *   const child = await familyApi.Child.get('1');
      *   const newParent = await familyApi.Parent.get('2');
      *   await child.change('parent', newParent);
      *
      * will send
      *
      *   PATCH /children/1/relationships/parent
      *   {"data": {"type": "parents", "id": "2"}}
      * */

    let actualValue = value;

    if (!(field in this.relationships)) {
      throw new Error(`${field} is not a relationship`);
    }

    actualValue = actualValue && this.constructor.API.asResource(actualValue);
    await this._editRelationship(
      'patch',
      field,
      actualValue && actualValue.asResourceIdentifier(),
    );
    if (!this.relationships[field]) {
      this.relationships[field] = {};
    }
    this.relationships[field].data = actualValue && actualValue.asResourceIdentifier();
    if ((this.related[field] || {}).id !== (actualValue || {}).id) {
      this.related[field] = actualValue;
    }
  }

  async add(field, values) {
    /*  Add items to a plural relationship. This will send a list of resource
      * identifiers with a POST request to the relationship's link. The link is
      * saved in `this.relationships[field].links.self` but it defaults to
      * `/${TYPE}/${this.id}/relationships/${field}`:
      *
      *   const parent = await familyApi.Parent.get('1');
      *   const child1 = await familyApi.Child.get('2');
      *   const child2 = await familyApi.Child.get('3');
      *   await parent.add('children', [child1, child2]);
      *
      * will send
      *
      *   POST /parents/1/relationships/children
      *   {"data": [{"type": "children", "id": "2"},
      *              {"type": "children", "id": "3"}]}
      *
      * According to {json:api}, this will have the result of **appending** the
      * new items to the relationship, but this behaviour depends on the
      * server. */

    await this._editPluralRelationship('post', field, values);
  }

  async reset(field, values) {
    /*  Reset all items of a plural relationship. This will send a list of
      * resource identifiers with a PATCH request to the relationship's link.
      * The link is saved in `this.relationships[field].links.self` but it
      * defaults to `/${TYPE}/${this.id}/relationships/${field}`:
      *
      *   const parent = await familyApi.Parent.get('1');
      *   const child1 = await familyApi.Child.get('2');
      *   const child2 = await familyApi.Child.get('3');
      *   await parent.reset('children', [child1, child2]);
      *
      * will send
      *
      *   PATCH /parents/1/relationships/children
      *   {"data": [{"type": "children", "id": "2"},
      *              {"type": "children", "id": "3"}]}
      *
      * According to {json:api}, this will have the result of **resetting** the
      * relationships with the new items, but this behaviour depends on the
      * server. */

    await this._editPluralRelationship('patch', field, values);
  }

  async remove(field, values) {
    /*  Remove items from a plural relationship. This will send a list of
      * resource identifiers with a DELETE request to the relationship's link.
      * The link is saved in `this.relationships[field].links.self` but it
      * defaults to `/${TYPE}/${this.id}/relationships/${field}`:
      *
      *   const parent = await familyApi.Parent.get('1');
      *   const child1 = await familyApi.Child.get('2');
      *   const child2 = await familyApi.Child.get('3');
      *   await parent.remove('children', [child1, child2]);
      *
      * will send
      *
      *   DELETE /parents/1/relationships/children
      *   {"data": [{"type": "children", "id": "2"},
      *              {"type": "children", "id": "3"}]}
      *
      * According to {json:api}, this will have the result of **removing** the
      * items from the relationship, but this behaviour depends on the server.
      * */

    await this._editPluralRelationship('delete', field, values);
  }

  async _editRelationship(method, field, data) {
    const url = _.get(
      this,
      `relationships.${field}.links.self`,
      `/${this.constructor.TYPE}/${this.id}/relationships/${field}`,
    );
    await this.constructor.API.request({ method, url, data: { data } });
  }

  async _editPluralRelationship(method, field, values) {
    const payload = values.map(
      (item) => this.constructor.API.asResource(item).asResourceIdentifier(),
    );
    await this._editRelationship(method, field, payload);
  }

  static list() {
    /* Return a new collection of this resource type.
      *
      * If you `.fetch()` the result, its `.data` will contain only the first
      * page of the collection. You can get modified copies of the result with
      * `.filter()`, `.page()`, `.include()`, `.sort()` and `.fields()` and
      * fetch those instead. The result will also support pagination with its
      * `.all()`, `.allPages()`, `.getNext()` and `.getPrevious()` methods.
      *
      *   const childrenAboveFive = familyApi.Child.
      *     list().
      *     filter({ age__gt: 5 });
      *   await childrenAboveFive.fetch();
      *   console.log(childrenAboveFive.data[0].get('name'));
      *
      * The `.filter()`, `.page()`, `.include()`, `.sort()` and `.fields()` are
      * attached as static methods on the `Resource` class. Their behaviour is
      * identical to adding them after a call to `.list()`:
      *
      *   familyApi.Child.filter({ age__gt: 5 });
      *   // equivalent to
      *   familyApi.Child.list().filter({ age__gt: 5 });
      * */

    return new Collection(this.API, this.getCollectionUrl());
  }

  async follow() {
    /*  If a response to the server has a redirect HTTP status code (3XX), you
      * can call `follow.()` on the resource object to get the axios response
      * made to the URL indicated by the Location header. This will most likely
      * happen after a call to `.save()`, `.create()` or `.reload()`:
      *
      *   const download = api.Download.create(...);
      *   let response;
      *   if (download.redirect) {
      *     response = await download.follow();
      *   }
      *   const timerId = setInterval(async () => {
      *     await download.reload();
      *     if (download.redirect) {
      *       response = await download.follow()
      *       clearInterval(timerId);
      *     }
      *   }, 1000);
      * */

    if (!this.redirect) {
      throw new Error('Cannot follow without redirect');
    }
    return axios.get(this.redirect);
  }

  static async bulkCreate(args) {
    /* Send a bulk POST request. The arguments can either be `Resource`
      * instances or JSON representations of them.
      *
      *   const child1 = familyApi.Child({ name: 'Bill' });
      *   const child2 = { type: 'children', attributes: { name: 'Joe' } };
      *   await familyApi.bulkCreate([child1, child2]);
      *
      * will send:
      *
      *   POST /children
      *   Content-Type: application/vnd.api+json;profile=bulk
      *   {"data": [{"type": "children", "attributes": {"name": "Bill"}},
      *             {"type": "children", "attributes": {"name": "Joe"}}]}
      * */

    const data = [];
    args.forEach((arg) => {
      const resource = this.API.asResource(arg);
      const payloadItem = { type: this.TYPE };
      if (_.size(resource.attributes)) {
        payloadItem.attributes = resource.attributes;
      }
      if (_.size(resource.relationships)) {
        payloadItem.relationships = resource.relationships;
      }
      if (resource.id) {
        payloadItem.id = resource.id;
      }
      data.push(payloadItem);
    });
    const response = await this.API.request({
      method: 'post',
      url: this.getCollectionUrl(),
      data: { data },
      bulk: true,
    });
    return Collection.fromData(this.API, response.data.data);
  }

  static async bulkDelete(args) {
    /* Send a bulk DELETE request. The arguments can either be `Resource`
      * instances or JSON representations of them.
      *
      *   const child1 = familyApi.Child({ id: '1' });
      *   const child2 = { type: 'children', id: '2' };
      *   await familyApi.bulkDelete([child1, child2]);
      *
      * will send:
      *
      *   DELETE /children
      *   Content-Type: application/vnd.api+json;profile=bulk
      *   {"data": [{"type": "children", "id": "1"},
      *             {"type": "children", "id": "2"}]}
      * */

    const data = [];
    args.forEach((arg) => {
      if (isResource(arg)) {
        data.push(arg.asResourceIdentifier());
      } else if (_.isPlainObject(arg)) {
        data.push(this.API.asResource(arg).asResourceIdentifier());
      } else {
        data.push({ type: this.TYPE, id: arg });
      }
    });
    await this.API.request({
      method: 'delete',
      url: this.getCollectionUrl(),
      data: { data },
      bulk: true,
    });
    return data.length;
  }

  static async bulkUpdate(args, fields) {
    /* Send a bulk PATCH request. The arguments can either be `Resource`
      * instances or JSON representations of them. You also need to specify the
      * fields you want to change.
      *
      *   const child1 = familyApi.Child.get('1')
      *   child1.set('name', 'Bill')
      *   const child2 = familyApi.Child.get('2')
      *   child2.set('name', 'Joe')
      *   await familyApi.bulkUpdate([child1, child2], ['name']);
      *
      * will send:
      *
      *   PATCH /children
      *   Content-Type: application/vnd.api+json;profile=bulk
      *   {"data": [
      *     {"type": "children", "id": "1", "attributes": {"name": "Bill"}},
      *     {"type": "children", "id": "2", "attributes": {"name": "Joe"}}
      *   ]}
      * */

    const data = [];
    args.forEach((arg) => {
      const resource = this.API.asResource(arg);
      const payloadItem = resource.asResourceIdentifier();
      fields.forEach((field) => {
        if (field in resource.attributes) {
          if (!('attributes' in payloadItem)) {
            payloadItem.attributes = {};
          }
          payloadItem.attributes[field] = resource.attributes[field];
        } else if (field in resource.relationships) {
          if (!('relationships' in payloadItem)) {
            payloadItem.relationships = {};
          }
          payloadItem.relationships[field] = resource.relationships[field];
        } else {
          throw new Error(`${field} is not part of one of the resources`);
        }
      });
      data.push(payloadItem);
    });
    const response = await this.API.request({
      method: 'patch',
      url: this.getCollectionUrl(),
      data: { data },
      bulk: true,
    });
    return Collection.fromData(this.API, response.data.data);
  }

  static async createWithForm(...props) {
    /*  Make a POST request to the collection URL, passing options directly to
      * axios */

    const response = await this.API.request({
      method: 'post',
      url: this.getCollectionUrl(),
      ...props,
    });
    const body = response.data;
    const { data, included } = body;
    if (included) {
      data.included = included;
    }
    return this.API.new(data);
  }

  getItemUrl() {
    let url = this.links.self;
    if (!url) {
      url = `/${this.constructor.TYPE}/${this.id}`;
    }
    return url;
  }

  static getCollectionUrl() {
    return `/${this.TYPE}`;
  }

  asResourceIdentifier() {
    return { type: this.constructor.TYPE, id: this.id };
  }

  asRelationship() {
    return { data: this.asResourceIdentifier() };
  }

  static extend({ name, TYPE, ...proto }) {
    /*  If you are using an environment that doesn't support classes, like an
      * old browser, you can use this static method to create a subclass for
      * the resource type:
      *
      *   var Child = Resource.extend({
      *     name: 'Child',
      *     TYPE: 'children',
      *     pprint: function() {
      *       return `<Child: ${this.id}>`;
      *     },
      *   });
      *
      *   // equivalent to
      *
      *   class Child extends Resource {
      *     static name = 'Child';
      *
      *     static TYPE = 'children';
      *
      *     pprint() {
      *       return `<Child: ${this.id}>`;
      *     }
      *   }
      * */

    const cls = class extends this {
      static name = name;

      static TYPE = TYPE;
    };
    Object.assign(cls.prototype, proto);
    return cls;
  }
}

['filter', 'page', 'include', 'sort', 'fields'].forEach((listMethod) => {
  Resource[listMethod] = function (...args) { /* eslint-disable-line func-names */
    return this.list()[listMethod](...args);
  };
});
