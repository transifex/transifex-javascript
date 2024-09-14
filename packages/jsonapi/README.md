# {json:api} SDK library for Javascript

This is a library that allows you to create SDKs for APIs that conform to the
[{json:api}](https://jsonapi.org/) specification. The design of this library,
as well as the structure of this README file, follow the principles of
[an equivalent library that was written for Python](https://github.com/wordsmith/wordsmith-python/tree/devel/wordsmith/api)
as much as possible.

## Setting up

```sh
npm install --save @wordsmith/jsonapi
```

Using  this library means creating your own API SDK for a remote service. In
order to do that, you need to first define an *API connection type*. This is
done by subclassing `JsonApi`:

```javascript
import { JsonApi } from '@wordsmith/jsonapi';

class FamilyApi extends JsonApi {
  static HOST = 'https://api.families.com';
}
```

Next, you have to define some *API resource types* and register them to the
*API connection type*. This is done by subclassing `Resource` and decorating it
with the connection type's `register` method:

```javascript
import { Resource } from '@wordsmith/jsonapi';

class Parent extends Resource {
  static TYPE = 'parents';
}
FamilyApi.register(Parent, 'Parent');

class Child extends Resource {
  static TYPE = 'children';
}
FamilyApi.register(Child, 'Child');
```

Users of your SDK can then instantiate your *API connection type*, providing
authentication credentials and/or overriding the host, in case you want to test
against a sandbox API server and not the production one:

```javascript
const familyApi = new FamilyApi({
  host: 'https://sandbox.api.families.com',
  auth: 'MYTOKEN',
});
```

Finally the API resource types you have registered can be accessed as
attributes on this _API connection instance_. You can either use the name you
provided as the second argument to `.register()` or the API resource's type:

```javascript
const child = await familyApi.Child.get('1')
const child = await familyApi.children.get('1')
```

This is enough to get you started since the library will be able to provide you
with a lot of functionality based on the structure of the responses you get
from the server. Make sure you define and register Resource subclasses for
every type you intend to encounter, because the library will use the API
instance's registry to resolve the appropriate subclass for the items included
in the API's responses.

### Non-ES Javascript

If you are running a version of Javascript that doesn't support classes, for
example an old browser, you can use the `extend` static methods of `JsonApi`
and `Resource` to achieve the same results:

```html
<html>
  <meta charset="UTF-8">
  <body>
    <script src="jsonapi.js"></script>
    <script>
      var JsonApi = window.jsonapi.JsonApi;
      var Resource = window.jsonapi.Resource;

      var FamilyApi = JsonApi.extend({
        HOST: 'https://api.families.com',
      });

      var Parent = Resource.extend({
        TYPE: 'parents',
      });

      FamilyApi.register(Parent, 'Parent');

      var familyApi = new FamilyApi({
        auth: 'MYTOKEN',
      });

      var parents = familyApi.Parent.list();
      parents.fetch().then(function() {
        console.log({ parents });
      })
    </script>
  </body>
</html>
```

### Global _API connection instances_

You can configure an already created _API connection instance_ by calling the
`setup` method, which accepts the same properties as the constructor. In
fact, `JsonApi`'s `constructor` and `setup` methods have been written in such a
way that the following two snippets should produce an identical outcome:

```javascript
const props = ...;
const familyApi = new FamilyApi(props);
```

```javascript
const props = ...;
const familyApi = new FamilyApi();
familyApi.setup(props);
```

This way, you can implement your SDK in a way that offers the option to users
to either use a _global API connection instance_ or multiple instances. In
fact, this is exactly how `@wordsmith/api` has been set up:

```javascript
// @wordsmith/api/src/index.js

import { JsonApi, Resource } from '@wordsmith/jsonapi';

export class WordsmithApi extends JsonApi {
  static HOST = 'https://api.wordsmith.is';
}

class Organization extends Resource {
  static TYPE = "organizations";
}
WordsmithApi.register(Organization, 'Organization');

export const wordsmithApi = WordsmithApi();
```

```javascript
// app.js (uses the global API connection instance)

import { wordsmithApi } from '@wordsmith/api';

wordsmithApi.setup({ auth: 'MYTOKEN' });
const organization = await wordsmithApi.Organization.get("1");
```

```javascript
// app.js (uses multiple custom API connection instances)

import { WordsmithApi } from '@wordsmith/api';

const api1 = new WordsmithApi({ auth: 'APITOKEN1' });
const api2 = new WordsmithApi({ auth: 'APITOKEN2' });

const organization1 = await api1.Organization.get('1');
const organization2 = await api2.Organization.get('2');
```

_(The whole logic behind this initialization process is further explained
[here](https://www.kbairak.net/programming/python/2020/09/16/global-singleton-vs-instance-for-libraries.html))_

### Authentication

The `auth` property to `JsonApi` or `setup` can either be:

1. A string, in which case all requests to the API server will include the
   `Authorization: Bearer <API_TOKEN>` header
2. A callable, in which case the return value is expected to be a dictionary
   which will be merged with the headers of all requests to the API server

   ```javascript
   import { FamilyApi } from './families';
   import { encrypt } from './crypto';

   function myAuth() {
     return { 'x-signature': encrypt(Date()) };
   }

   const familyApi = new FamilyApi({ auth: myAuth });
   ```

## Retrieval

### URLs

By default, collection URLs have the form `/<type>` (eg `/children`) and item
URLs have the form `/<type>/<id>` (eg `/children/1`). This is also part of
{json:api}'s recommendations. If you want to customize them, you need to
override the `getCollectionUrl` static method and the `getItemUrl()` method
of the resource's subclass:

```javascript
class Child extends Resource {
  static TYPE = 'children';

  static getCollectionUrl() {
      return '/children_collection';
  }

  getItemUrl() {
      return `/child_item/${this.id}`;
  }
}
FamilyApi.register(Child, 'Child');
```

### Getting a single resource object from the API

If you know the ID of the resource object, you can fetch its {json:api}
representation with:

```javascript
const child = await familyApi.Child.get('1');
```

The attributes of a resource object are `id`, `attributes`, `relationships`,
`links` and `related`. `id`, `attributes`, `relationships` and `links` have
exactly the same value as in the API response.

```javascript
const parent = await familyApi.Parent.get('1');
console.log(parent.id);
// <<< '1'
console.log(parent.attributes);
// <<<  { name: 'Zeus' }
console.log(parent.relationships);
// <<< { children: { links: { self: '/parent/1/relationships/children',
// ...                        related: '/children?filter[parent]=1' } } }

const child = await familyApi.Child.get('1');
console.log(child.id);
// <<< '1'
console.log(child.attributes);
// <<<  { name: 'Hercules' }
console.log(child.relationships);
// <<< { parent: { data: { type: 'parents', id: '1' },
// ...             links: { self: '/children/1/relationships/parent',
// ...                      related: '/parents/1' } } }
```

You can reload an object from the server by calling `.reload()`:

```javascript
await child.reload();
// equivalent to
child = await familyApi.Child.get(child.id);
```

### Relationships

#### Intro

We need to talk a bit about how {json:api} represents relationships and how the
`wordsmith.api.jsonapi` library interprets them. Depending on the value of a
field of `relationships`, we consider the following possibilities. A
relationship can either be:

1. A **null** relationship which will be represented by a null value:

   ```javascript
   { type: 'children',
     id: '...',
     attributes: { ... },
     relationships: {
         parent: null,  // <---
         ...,
     },
     links: { ... } }
   ```

2. A **singular** relationship which will be represented by an object with both
   `data` and `links` fields, with the `data` field being a dictionary:

   ```javascript
   { type: 'children',
     id: '...',
     attributes: { ... },
     relationships: {
       parent: { data: { type: 'parents', id: '...' },      // <---
                 links: { self: '...', related: '...' } },  // <---
       ... ,
     },
     links: { ... } }
   ```

3. A **plural** relationship which will be represented by an object with a
   `links` field and either a missing `data` field or a `data` field which is a
   list:

   ```javascript
   { type: 'parents',
     id: '...',
     attributes: { ... },
     relationships: {
       children: { links: { self: '...', related: '...' } },  // <---
       ...,
     },
     links: { ... } }
   ```

   or

   ```javascript
   { type: 'parents',
     id: '...',
     attributes: { ... },
     relationships: {
       children: { links: { self: '...', related: '...' },    // <---
                   data: [{ type: 'children', id: '...' },    // <---
                          { type: 'children', id: '...' },    // <---
                          ... ] },                            // <---
       ... ,
     },
     links: { ... } }
   ```

This is important because the library will make assumptions about the nature of
relationships based on the existence of these fields.

#### Fetching relationships

The `related` field is meant to host the data of the relationships, **after**
these have been fetched from the API. Lets revisit the last example and inspect
the `relationships` and `related` fields:

```javascript
const parent = await familyApi.Parent.get('1');
console.log(parent.relationships);
// <<< { children: { links: { self: '/parent/1/relationships/children',
// ...                        related: '/children?filter[parent]=1' } } }
console.log(parent.related);
// <<< {}

const child = await familyApi.Child.get('1');
console.log(child.relationships);
// <<< { parent: { data: { type: 'parents', id: '1' },
// ...             links: { self: '/children/1/relationships/parent',
// ...                      related: '/parents/1' } } }
console.log(child.related.id);
// <<< '1'
console.log(child.related.attributes);
// <<< {}
console.log(child.related.relationships);
// <<< {}
```

As you can see, the _parent→children_ `related` field is empty while the
_child→parent_ `related` field is prefilled with an "unfetched" Parent
instance. This happens because the first one is a _plural_ relationship while
the second is a _singular_ relationship. Unfetched means that we only know its
`id` so far. In both cases, we don't know any meaningful data about the
relationships yet.

In order to fetch the related data, you need to call `.fetch()` with the names
of the relationship you want to fetch:

```javascript
await child.fetch('parent');  // Now `related.parent` has all the information
console.log(child.related.parent.id);
// <<< '1'
console.log(child.related.parent.attributes);
// <<< { name: 'Zeus' }
console.log(child.related.parent.relationships);
// <<< { children: { links: { self: '/parent/1/relationships/children',
// ...                        related: '/children?filter[parent]=1' } } })

await parent.fetch('children');
await parent.related.children.fetch();
console.log(parent.related.children.data[0].id);
// <<< '1'
console.log(parent.related.children.data[0].attributes);
// <<< { name: 'Hercules' }
console.log(parent.related.children.data[0].relationships);
// <<< { parent: { data: { type: 'parents', id: '1' },
// ...             links: { self: '/children/1/relationships/parent',
// ...                      related: '/parents/1' } } }
```

Trying to fetch an already-fetched relationship will not actually trigger
another request, unless you pass `{ force: true }` to `.fetch()`.

`.fetch()` will return the relation:

```javascript
const children = await parent.fetch('children');
// is equivalent to
await parent.fetch('children');
const children = parent.related.children;

await children.fetch();
console.log(children.data[0].attributes.name);
// <<< 'Hercules'
```

Since `.fetch()` behaves lazily by default, ie it won't interact with the
server again if the relationship is already fetched, it may be preferable to
access relationships with `.fetch()` every time instead of `.related`, since
then you won't have to worry about making sure that the relationship was
fetched beforehand.

### Shortcuts

You can access attributes and fetched relationships directly , or you can use
the `.get()` shortcut which will work for both attributes and relationships:

```javascript
console.log(child.get('name'));
// equivalent to
console.log(child.attributes.name);

console.log(child.get('parent').get('name'));
// equivalent to
console.log(child.related.parent.attributes.name);
```

_(although for relationships using `.fetch()` may be preferable, as mentioned
before)_

You can also set attributes and relationships using `.set()`:

```javascript
child.set('name', 'Achilles');
// equivalent to
child.attributes.name = 'Achilles';
```

For relationships, using `.set()` is preferable to editing `relationships` and
`related` by hand. `.set()` will make sure that the argument will be
interpreted as a {json:api} relationship, and it will take care to empty the
pre-fetched value in case the relationship has changed:

```javascript
child.set('parent', { data: { type: 'parents', id: '1' } });
// equivalent to
child.set('parent', new familyApi.Parent({ id: '1' }));
```

```javascript
await child.fetch('parent');
child.set('parent', new familyApi.Parent({ id: '2' }));

// Will re-fetch since the parent was changed and we don't have pre-fetched
// information on the new parent
await child.fetch('parent');
```

### Getting Resource collections

You can access a collection of resource objects using one of the `list`,
`filter`, `page`, `include`,`sort`, `fields` and `extra` static methods of the
Resource subclass.

```javascript
const children = familyApi.Child.list();
await children.fetch();
console.log(children.data[0].get('name'));
```

Each method does the following:

- `list` returns the first page of the results

- `filter` applies filters; nested filters are separated by double underscores
  (`__`), Django-style

  | operation              | GET request       |
  |------------------------|-------------------|
  | `.filter({ a: 1 })`    | `?filter[a]=1`    |
  | `.filter({ a__b: 1 })` | `?filter[a][b]=1` |

  _Note: because it's a common use-case, using a resource object as the value
  of a filter operation will result in using its `id` field_

  ```javascript
  const parent = await familyApi.Parent.get('1');

  familyApi.Child.filter({ parent: parent });
  // is equivalent to
  familyApi.Child.filter({ parent: parent.id });
  ```

- `page` applies pagination; it accepts either one positional argument which
  will be passed to the `page` GET parameter or multiple properties which will
  be passed as nested `page` GET parameters

  | operation               | GET request            |
  |-------------------------|------------------------|
  | `.page(1)`              | `?page=1`              |
  | `.page({ a: 1, b: 2 })` | `?page[a]=1&page[b]=2` |

  (_Note: you will probably not have to use `.page` yourself since the returned
  lists support pagination on their own, see below_)

- `include` will set the `include` GET parameter; it accepts multiple
  positional arguments which it will join with commas (`,`)

  | operation                   | GET request           |
  |-----------------------------|-----------------------|
  | `.include('parent', 'pet')` | `?include=parent,pet` |

- `sort` will set the `sort` GET parameter; it accepts multiple positional
  arguments which it will join with commas (`,`)

  | operation              | GET request      |
  |------------------------|------------------|
  | `.sort('age', 'name')` | `?sort=age,name` |

- `fields` will set the `fields` GET parameter; it accepts multiple positional
  arguments which it will join with commas (`,`)

  | operation                | GET request        |
  |--------------------------|--------------------|
  | `.fields('age', 'name')` | `?fields=age,name` |

- `extra` accepts any keyword arguments which will be added to the GET
  parameters sent to the API

  | operation                     | GET request     |
  |-------------------------------|-----------------|
  | `.extra({ group_by: 'age' })` | `?group_by=age` |

- `all` returns a generator that will yield all results of a paginated
  collection, using multiple requests if necessary; the pages are fetched
  on-demand, so if you abort the generator early, you will not be performing
  requests against every possible page

  ```javascript
  const list = familyApi.Child.list();
  for await (const child of list.all()) {
    console.log(child.get('name'));
  }
  ```

- `allPages` returns a generator of non-empty pages; similarly to `all`, pages
  are fetched on-demand (in fact, `all` uses `allPages` internally)

All the above methods can be chained to each other. So:

```javascript
familyApi.Child.list().filter({ a: 1 });
// is equivalent to
familyApi.Child.filter({ a: 1 });

familyApi.Child.filter({ a: 1 }).filter({ b: 2 });
// is equivalent to
familyApi.Child.filter({ a: 1, b: 2 });
```

Also, in order for the chaining to work, the collections are also lazy. You
will not actually make any requests to the server until you await a `.fetch()`
call on the collection. So this:

```javascript
function getChildren({ gender = null, hair_color = null }) {
  let result = familyApi.Child.list();
  if (gender) {
    result = result.filter({ gender });
  }
  if (hair_color) {
    result = result.filter({ hair_color });
  }
  return result
}
const children = getChildren({ hair_color: 'red' });
await children.fetch();
```

will only make one request to the server during the resolution of the
`.fetch()` call in the last line.

You can also access pagination via the `getNext()`, and `getPrevious()` methods
of a returned page, provided that that the page's `.next` and `.previous`
attributes are not `null` (in fact, `all()` and `allPages()` use `getNext()`
internally):

```javascript
const all = [];
let page = familyApi.Child.list();
await page.fetch();
while (true) {
  for (const item of page.data) {
    all.push(item);
  }
  if (! page.next) {
    break;
  }
  page = await page.getNext();
}
```

All the previous methods also work on plural relationships (assuming the API
supports the applied filters etc on the endpoint specified by the `related`
link of the relationship).

```javascript

const children = await parent.fetch('children');
const filteredChildren = children.filter({ name: "Hercules" });
await filteredChildren.fetch();
console.log(filteredChildren.data[0].get('name'));
```

_(Don't be confused by the double appearance of `.fetch()`; the first time we
are getting an unfetched collection representing the `parent->children`
relationship, the second time we are converting the unfetched page to a fetched
one)_

### Prefetching relationships with `include`

If you use the `include` method on a collection retrieval or if you use the
`include` property on `.get()` (and if the server supports it), the included
values of the response will be used to prefill the relevant fields of
`related`:

```javascript
const child = await familyApi.Child.get('1', { include: ['parent'] })
console.log(child.get('parent').get('name'));  // No need to fetch the parent
// <<< 'Zeus'

const children = familyApi.Child.list().include('parent')
await children.fetch();
// No need to fetch the parents
console.log(children.data[0].get('parent').get('name'));
// <<< 'Zeus'
console.log(children.data[1].get('parent').get('name'));
// <<< 'Zeus'
// ...
```

In case of a plural relationships with a list `data` field, if the response
supplies the related items in the `included` section, these too will be
prefilled.

```javascript
const parent = await familyApi.Parent.get('1', { include: ['children'] });

// Assuming the response looks like:
// {'data': {'type': "parents",
//           'id': "1",
//           'attributes': ...,
//           'relationships': {'children': {'data': [{'type': "children", 'id': "1"},
//                                                   {'type': "children", 'id': "2"}],
//                                          'links': ...}}},
//  'included': [{'type': "children",
//                'id': "1",
//                'attributes': {'name': "Hercules"}},
//               {'type': "children",
//                'id': "2",
//                'attributes': {'name': "Achilles"}}]}

// No need to fetch
console.log(parent.get('children').data[0].get('name'));
// <<< 'Hercules'
console.log(parent.get('children').data[1].get('name'));
// <<< 'Achilles'
```

### Getting single resource objects using filters

Appending `.get()` to a collection will ensure that the collection is of size 1
and return the one resource instance in it. If the collection's size isn't 1,
it will raise an error.

```javascript
const child = await familyApi.Child.filter({ name: 'Bill' }).get();
```

The `Resource`'s `.get()` static method, which we covered before, also accepts
properties as an argument. Calling it this way will apply the filters and use
the collection's `.get()` method on the result.

```javascript
const child = await familyApi.Child.get({ name: 'Bill' });
// is equivalent to
const child = await familyApi.Child.filter({ name: 'Bill' }).get();
```

## Editing

### Saving changes

After you change some attributes or relationships, you can call `.save()` on an
object, which will trigger a PATCH request to the server. Because usually the
server includes immutable fields with the response (creation timestamps etc),
you don't want to include all attributes and relationships in the request. You
can specify which fields will be sent with `save`'s argument:

```javascript
const child = await familyApi.Child.get('1');
child.set('name', child.get('name') + ' the Great!');
await child.save(['name']);
```

Because setting values right before saving is a common use-case, `.save()` also
accepts properties. These will be set on the resource object, right before the
actual saving:

```javascript
await child.save({ name: 'Hercules' });
// is equivalent to
child.set('name', 'Hercules');
await child.save(['name']);
```

### Creating new resources

Calling `.save()` on an object whose `id` is not set will result in a POST
request which will (attempt to) create the resource on the server.

```javascript
const parent = await familyApi.Parent.get('1');
const child = new familyApi.Child({
  attributes: { name: 'Hercules' },
  relationships: { parent },
});
await child.save();
```

After saving, the object will have the `id` returned by the server, plus any
other server-generated attributes and relationships (for example, creation
timestamps).

There is a shortcut for the above, called `.create()`

```javascript
const parent = await familyApi.Parent.get('1');
const child = await familyApi.Child.create({
  attributes: { name: 'Hercules' },
  relationships: { parent },
});
```

_Note: for relationships, you can provide either a resource instance, a
"Resource Identifier" (the 'data' value of a relationship object) or an entire
relationship from another resource. So, the following are equivalent:_

```javascript
// Well, almost equivalent, the first example will trigger a request to fetch
// the parent's data from the server
const child = await familyApi.Child.create({
  attributes: { name: 'Hercules' },
  relationships: { parent: await familyApi.Parent.get('1') },
});
const child = await familyApi.Child.create({
  attributes: { name: 'Hercules' },
  relationships: { parent: new familyApi.Parent({ id: '1' }) },
});
const child = familyApi.Child.create({
  attributes: { name: 'Hercules' },
  relationships: { parent: { type: 'parents', id: '1' } },
});
const child = familyApi.Child.create({
  attributes: { name: 'Hercules' },
  relationships: { parent: { data: { type: 'parents', id: '1' } } },
});
```

This way, you can reuse a relationship from another object when creating,
without having to fetch the relationship:

```javascript
const newChild = await familyApi.Child.create({
  attributes: { name: 'Achilles' },
  relationships: { parent: old_child.get('parent') },
});
```

#### Magic properties

When making new (unsaved) instances, or when you create instances on the server
with `.create()`, you can supply any property apart from `id`, `attributes`,
`relationships`, etc and they will be interpreted as attributes or
relationships. Anything that looks like a relationship will be interpreted as
such while everything else will be interpreted as an attribute.

Things that are interpreted as relationships are:

- Resource instances
- Resource identifiers - dictionaries with 'type' and 'id' fields
- Relationship objects - dictionaries with a single 'data' field whose value is
  a resource identifier

So

```javascript
new familyApi.Child({ name: 'Hercules' });
// is equivalent to
new familyApi.Child({ attributes: { name: 'Hercules' } });

new familyApi.Child({ parent: { type: 'parents', id: '1' } });
// is equivalent to
new familyApi.Child({ relationships: { parent: { type: 'parents', id: '1' } } });

new familyApi.Child({ parent: new familyApi.Parent({ id: '1' }) });
// is equivalent to
new familyApi.Child({ relationships: { parent: new familyApi.Parent({ id: '1' }) } });
```

If you are worried about naming conflicts, for example if you want to have an
attribute called 'attributes' etc, you should fall back to using 'attributes'
and 'relationships' directly.

```javascript
// Don't do this
new familyApi.Child({ attributes: [1, 2, 3] });
// Do this instead
new familyApi.Child({ attributes: { attributes: [1, 2, 3] } });
```

#### Client-generated IDs

Since `.save()` will issue a PATCH request when invoked on objects that have an
ID, if you want to supply your own client-generated ID during creation, you
**have** to use `.create()`, which will always issue a POST request.

```javascript
await (new familyApi.Child(attributes={ name: 'Hercules' })).save();
// POST: {data: {type: "children", attributes: {name: "Hercules"}}}

await (new familyApi.Child({ id: '1', attributes: { name: 'Hercules' } })).save();
// PATCH: {data: {type: "children", id: "1", attributes: {name: "Hercules"}}}

await familyApi.Child.create({ attributes: { name: 'Hercules' } });
// POST: {data: {type: "children", attributes: {name: "Hercules"}}}

await familyApi.Child.create({ id: '1', attributes: { name: 'Hercules' } });
// POST: {data: {type: "children", id: "1", attributes: {name: "Hercules"}}}
// ^^^^
```

### Deleting

Deleting happens simply by calling `.delete()` on an object. After deletion,
the object will have the same data as before, except its `id` will be set to
`None`. This happens in case you want to delete an object and instantly
re-create it, with a different ID.

```javascript
const child = await familyApi.Child.get('1');
await child.delete();

// Will create a new child with the same name and parent as the previous one
await child.save(['name', 'parent']);

console.log(child.id === null || child.id == '1');
// <<< false
```

### Editing relationships

#### Singular relationships

Changing a singular relationship can happen in two ways (this also depends on
what the server supports).

```javascript
const child = await familyApi.Child.get('1');

child.set('parent', newParent);
await child.save(['parent']);

// or

await child.change('parent', newParent);
```

The first one will send a PATCH request to `/children/1` with a body of:

```json
{"data": {"type": "children",
          "id": "1",
          "relationships": {"parent": {"data": {"type": "parents", "id": "2"}}}}}
```

The second one will send a PATCH request to the URL indicated by
`child.relationships.parent.links.self`, which will most likely be
something like `/children/1/relationships/parent`, with a body of:

```json
{"data": {"type": "parents", "id": "2"}}
```

#### Plural relationships

For changing plural relationships, you can use one of the `add`, `remove` and
`reset` methods:

```javascript
const parent = await familyApi.Parent.get('1');
parent.add('children', [new_child, ...])
parent.remove('children', [existing_child, ...])
parent.reset('children', [child_a, child_b, ...])
```

These will send a POST, DELETE or PATCH request respectively to the URL
indicated by `parent.relationships.children.links.self`, which will most likely
be something like `/parents/1/relationships/children`, with a body of:

```json
{"data": [{"type": "children", "id": "1"},
          {"type": "children", "id": "2"},
          {"...": "..."}]}
```

Similar to the case when we were instantiating objects with relationships, the
values passed to the above methods can either be resource objects, "resource
identifiers" or entire relationship objects:

```javascript
await parent.add('children', [await familyApi.Child.get("1"),
                              new familyApi.Child({ id: '2' }),
                              { type: 'children', id: '3' },
                              { data: { type: 'children', id: '4' } }]);
```

### Bulk operations

Resource subclasses provide the `bulkDelete`, `bulkCreate` and `bulkUpdate`
static methods for API endpoints that support such operations. These static
methods accepts lists of resource objects or {json:api} representations on
which the operation will be performed on. Furthermore, `bulkUpdate` accepts a
`fields` argument with the `attributes` and `relationships` of the objects it
will attempt to update.

```javascript
// Bulk-create
const children = await familyApi.Child.bulkCreate([
   new familyApi.Child({ name: 'One', parent: parent }),
   { type: 'children', attributes: { name: 'Two' }, relationships: { parent: parent } },
]);

// Bulk-update
const child = await familyApi.Child.get('a');
child.set('married', true);

const children = await familyApi.Child.bulkUpdate(
   [child, { type: 'children', id: 'b', attributes: { married: true } }],
   ['married'],
);

// Bulk-delete
const child = await familyApi.Child.get('a');
const deletedCount = await familyApi.Child.bulkDelete([child, { id: 'b' }, 'c']);

const parent = await familyApi.Parent.get('1');
const childrenCollection = await parent.fetch('children');
const allChildren = [];
for await (const child of children_collection.all()) {
  allChildren.push(child);
}
await familyApi.Child.bulkDelete(allChildren);
```
