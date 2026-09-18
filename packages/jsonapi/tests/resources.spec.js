/* global test expect, jest */

import axios from 'axios';

import { api, expectRequestMock } from './utils';

jest.mock('axios');

test('Simple Resource constructor', () => {
  const item = new api.Item({
    id: '1', attributes: { name: 'one' }, links: { self: '/items/1' },
  });
  expect(item).toEqual({
    id: '1',
    attributes: { name: 'one' },
    links: { self: '/items/1' },
    relationships: {},
    related: {},
    redirect: null,
  });
});

test('Constructor with JSON relationship', () => {
  const child = new api.Child({
    relationships: {
      parent: {
        data: { type: 'parents', id: '1' },
        links: {
          self: '/children/2/relationships/parent',
          related: '/parents/1',
        },
      },
    },
  });
  expect(child).toEqual({
    id: null,
    attributes: {},
    links: {},
    redirect: null,
    relationships: {
      parent: {
        data: { type: 'parents', id: '1' },
        links: {
          self: '/children/2/relationships/parent',
          related: '/parents/1',
        },
      },
    },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });
  expect(child.related.parent.constructor.TYPE).toEqual('parents');
  expect(child.related.parent.constructor.API).toBe(api);
});

test('Constructor with Resource relationship', () => {
  const parent = new api.Parent({ id: '1' });
  const child = new api.Child({ relationships: { parent } });
  expect(child).toEqual({
    id: null,
    attributes: {},
    links: {},
    redirect: null,
    relationships: { parent: { data: { type: 'parents', id: '1' } } },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });
  expect(child.related.parent.constructor.TYPE).toEqual('parents');
  expect(child.related.parent.constructor.API).toBe(api);
});

test('Constructor with null relationship', () => {
  const child = new api.Child({ relationships: { parent: null } });
  expect(child).toEqual({
    id: null,
    attributes: {},
    links: {},
    redirect: null,
    relationships: { parent: null },
    related: { parent: null },
  });
});

test('Constructor with resource identifier relationship', () => {
  const child = new api.Child({
    relationships: { parent: { type: 'parents', id: '1' } },
  });
  expect(child).toEqual({
    id: null,
    attributes: {},
    links: {},
    redirect: null,
    relationships: {
      parent: {
        data: { type: 'parents', id: '1' },
      },
    },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });
  expect(child.related.parent.constructor.TYPE).toEqual('parents');
  expect(child.related.parent.constructor.API).toBe(api);
});

test('Constructor with magic props', () => {
  let item;
  const check = () => {
    expect(item).toEqual({
      id: null,
      attributes: { name: 'the item' },
      links: {},
      redirect: null,
      relationships: { parent: { data: { type: 'parents', id: '1' } } },
      related: {
        parent: {
          id: '1',
          attributes: {},
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        },
      },
    });
  };

  item = new api.Child({
    name: 'the item',
    parent: new api.Parent({ id: '1' }),
  });
  check();

  item = new api.Child({
    name: 'the item',
    parent: { type: 'parents', id: '1' },
  });
  check();

  item = new api.Child({
    name: 'the item',
    parent: { data: { type: 'parents', id: '1' } },
  });
  check();
});

test('Constructor with non-relationship array magic prop', () => {
  expect(new api.Item({ tags: [1, 2, 3] })).toEqual({
    id: null,
    attributes: { tags: [1, 2, 3] },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
  expect(new api.Item({ tags: [] })).toEqual({
    id: null,
    attributes: { tags: [] },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
});

test('set', () => {
  const child = new api.Child({ relationships: { parent: null } });
  child.set('name', 'my name');
  expect(child).toEqual({
    id: null,
    attributes: { name: 'my name' },
    links: {},
    redirect: null,
    relationships: { parent: null },
    related: { parent: null },
  });
  child.set('parent', new api.Parent({ id: '1' }));
  expect(child).toEqual({
    id: null,
    attributes: { name: 'my name' },
    links: {},
    redirect: null,
    relationships: { parent: { data: { type: 'parents', id: '1' } } },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });
});

test('reload', async () => {
  const item = new api.Item({ id: '1' });
  axios.request.mockResolvedValue({
    data: {
      data: {
        id: '1',
        attributes: { name: 'the item' },
      },
    },
  });
  await item.reload();
  expect(item).toEqual({
    id: '1',
    attributes: { name: 'the item' },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
  expectRequestMock({ method: 'get', url: '/items/1', params: null });
});

test('static get', async () => {
  axios.request.mockResolvedValue({
    data: {
      data: {
        id: '1',
        attributes: { name: 'the item' },
      },
    },
  });
  const item = await api.Item.get('1');
  expect(item).toEqual({
    id: '1',
    attributes: { name: 'the item' },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
  expectRequestMock({ method: 'get', url: '/items/1', params: null });
});

test('fetch', async () => {
  const child = new api.Child({
    id: '1',
    parent: { data: { type: 'parents', id: '2' } },
  });
  axios.request.mockResolvedValue({
    data: {
      data: {
        id: '2',
        attributes: { name: 'the parent' },
      },
    },
  });
  const parent = await child.fetch('parent');
  expect(parent).toEqual({
    id: '2',
    attributes: { name: 'the parent' },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
  expect(child).toEqual({
    id: '1',
    attributes: {},
    links: {},
    redirect: null,
    relationships: { parent: parent.asRelationship() },
    related: { parent },
  });
  expectRequestMock({ method: 'get', url: '/parents/2', params: null });
});

test('patch', async () => {
  const parent2 = new api.Parent({ id: '2' });
  const parent3 = new api.Parent({ id: '3' });
  let child;

  function before() {
    child = new api.Child({ id: '1', name: 'John', parent: parent2 });
    axios.request.mockResolvedValue({
      data: {
        data: {
          id: '1',
          attributes: { name: 'Bill' },
          relationships: { parent: { data: { type: 'parents', id: '3' } } },
        },
      },
    });
  }

  function after() {
    expectRequestMock({
      method: 'patch',
      url: '/children/1',
      data: {
        data: {
          type: 'children',
          id: '1',
          attributes: { name: 'Bill' },
          relationships: { parent: { data: { type: 'parents', id: '3' } } },
        },
      },
    });
    expect(child).toEqual({
      id: '1',
      attributes: { name: 'Bill' },
      links: {},
      redirect: null,
      relationships: { parent: { data: { type: 'parents', id: '3' } } },
      related: { parent: parent3 },
    });
  }

  before();
  child.set('name', 'Bill');
  child.set('parent', parent3);
  await child.save(['name', 'parent']);
  after();

  before();
  await child.save({ name: 'Bill', parent: parent3 });
  after();

  before();
  child.set('name', 'Bill');
  await child.save(['name'], { parent: parent3 });
  after();
});

test('patch Null Relationship', async () => {
  const parent = new api.Parent({ id: '2' });
  const child = new api.Child({ id: '1', name: 'John', parent });

  axios.request.mockResolvedValue({
    data: {
      data: {
        id: '1',
        attributes: { name: 'Bill' },
        relationships: { parent: null },
      },
    },
  });
  child.set('name', 'Bill');
  await child.save(['name']);
  expectRequestMock({
    method: 'patch',
    url: '/children/1',
    data: {
      data: {
        type: 'children',
        id: '1',
        attributes: { name: 'Bill' },
      },
    },
  });
  expect(child).toEqual({
    id: '1',
    attributes: { name: 'Bill' },
    links: {},
    redirect: null,
    relationships: { parent: null },
    related: { parent: null },
  });
});

test('save new', async () => {
  const child = new api.Child({ name: 'John' });
  axios.request.mockResolvedValue({
    data: {
      data: {
        id: '1',
        attributes: { name: 'John', created: 'now' },
      },
    },
  });
  await child.save();
  expectRequestMock({
    method: 'post',
    url: '/children',
    data: { data: { type: 'children', attributes: { name: 'John' } } },
  });
  expect(child).toEqual({
    id: '1',
    attributes: { name: 'John', created: 'now' },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
});

test('save new with plural relationship', async () => {
  const parent = new api.Parent({
    name: 'Bill',
    children: [new api.Child({ id: '1' }), new api.Child({ id: '2' })],
  });
  axios.request.mockResolvedValue({
    method: 'post',
    url: '/parents',
    data: {
      data: {
        type: 'parents',
        id: '1',
        attributes: { name: 'Bill', created: 'now' },
        relationships: {
          children: { links: { related: '/parents/1/children' } },
        },
      },
    },
  });
  await parent.save();
  expectRequestMock({
    url: '/parents',
    method: 'post',
    data: {
      data: {
        type: 'parents',
        attributes: { name: 'Bill' },
        relationships: {
          children: {
            data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
          },
        },
      },
    },
  });
  expect(parent).toEqual({
    id: '1',
    attributes: { name: 'Bill', created: 'now' },
    links: {},
    redirect: null,
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
      },
    },
    related: {
      children: {
        _API: api,
        _url: null,
        _params: null,
        data: [
          {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('create', async () => {
  axios.request.mockResolvedValue({
    data: {
      data: {
        id: '1',
        attributes: { name: 'John', created: 'now' },
      },
    },
  });
  const child = await api.Child.create({ name: 'John' });
  expectRequestMock({
    method: 'post',
    url: '/children',
    data: { data: { type: 'children', attributes: { name: 'John' } } },
  });
  expect(child).toEqual({
    id: '1',
    attributes: { name: 'John', created: 'now' },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
});

test('create with plural relationship', async () => {
  axios.request.mockResolvedValue({
    method: 'post',
    url: '/parents',
    data: {
      data: {
        type: 'parents',
        id: '1',
        attributes: { name: 'Bill', created: 'now' },
        relationships: {
          children: { links: { related: '/parents/1/children' } },
        },
      },
    },
  });
  const parent = await api.Parent.create({
    name: 'Bill',
    children: [new api.Child({ id: '1' }), new api.Child({ id: '2' })],
  });
  expectRequestMock({
    url: '/parents',
    method: 'post',
    data: {
      data: {
        type: 'parents',
        attributes: { name: 'Bill' },
        relationships: {
          children: {
            data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
          },
        },
      },
    },
  });
  expect(parent).toEqual({
    id: '1',
    attributes: { name: 'Bill', created: 'now' },
    links: {},
    redirect: null,
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
      },
    },
    related: {
      children: {
        _API: api,
        _url: null,
        _params: null,
        data: [
          {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('delete', async () => {
  const child = new api.Child({ id: '1', name: 'John' });
  axios.request.mockResolvedValue({});
  await child.delete();
  expectRequestMock({ method: 'delete', url: '/children/1' });
  expect(child).toEqual({
    id: null,
    attributes: { name: 'John' },
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  });
});

test('change', async () => {
  const child = new api.Child({ id: '1', relationships: { parent: null } });
  axios.request.mockResolvedValue({});

  await child.change('parent', new api.Parent({ id: '2' }));
  expectRequestMock({
    method: 'patch',
    url: '/children/1/relationships/parent',
    data: { data: { type: 'parents', id: '2' } },
  });
  expect(child.related.parent.id).toBe('2');

  await child.change('parent', null);
  expectRequestMock({
    method: 'patch',
    url: '/children/1/relationships/parent',
    data: { data: { type: 'parents', id: '2' } },
  });
  expect(child.related.parent).toBeNull();
});

test('edit plural relationships', async () => {
  const parent = new api.Parent({
    id: '1',
    relationships: {
      children: { links: { self: '/parents/1/relationships/children' } },
    },
  });
  axios.request.mockResolvedValue({});
  // eslint-disable-next-line no-restricted-syntax
  for (const row of [
    ['add', 'post'], ['reset', 'patch'], ['remove', 'delete'],
  ]) {
    const [instanceMethod, method] = row;
    // eslint-disable-next-line no-await-in-loop
    await parent[instanceMethod](
      'children',
      [new api.Child({ id: '2' }), new api.Child({ id: '3' })],
    );
    expectRequestMock({
      method,
      url: '/parents/1/relationships/children',
      data: {
        data: [
          { type: 'children', id: '2' },
          { type: 'children', id: '3' },
        ],
      },
    });
  }
});

test('constructor with include', () => {
  const child = new api.Child({
    id: '1',
    parent: { type: 'parents', id: '2' },
    included: [{ type: 'parents', id: '2', attributes: { name: 'Zeus' } }],
  });
  expect(child.get('parent').get('name')).toEqual('Zeus');
});

test('get with include', async () => {
  axios.request.mockResolvedValue({
    data: {
      data: {
        type: 'children',
        id: '1',
        relationships: { parent: { data: { type: 'parents', id: '2' } } },
      },
      included: [{ type: 'parents', id: '2', attributes: { name: 'Zeus' } }],
    },
  });
  const child = await api.Child.get('1', { include: ['parent'] });
  expectRequestMock({
    method: 'get',
    url: '/children/1',
    params: { include: 'parent' },
  });
  expect(child.get('parent').get('name')).toEqual('Zeus');
});

test('redirect', async () => {
  const item = new api.Item({ id: '1' });
  axios.request.mockResolvedValue({
    status: 302,
    headers: { location: 'http://redirect.com' },
  });
  await item.reload();
  expect(item.redirect).toEqual('http://redirect.com');
});

test('get with included plural relationship', async () => {
  axios.request.mockResolvedValue({
    data: {
      data: {
        type: 'parents',
        relationships: {
          children: {
            links: { related: '/parents/1/children' },
            data: [{ type: 'children', id: '2' }, { type: 'children', id: '3' }],
          },
        },
      },
      included: [
        {
          type: 'children',
          id: '2',
          attributes: { name: 'Hercules' },
          relationships: { parent: { data: { type: 'parents', id: '1' } } },
        },
        {
          type: 'children',
          id: '3',
          attributes: { name: 'Achilles' },
          relationships: { parent: { data: { type: 'parents', id: '1' } } },
        },
      ],
    },
  });
  const parent = await api.Parent.get('1', { include: ['children'] });
  expect(parent.get('children')).toEqual({
    _API: api,
    _url: '/parents/1/children',
    _params: null,
    data: [
      {
        id: '2',
        attributes: { name: 'Hercules' },
        links: {},
        redirect: null,
        relationships: { parent: { data: { type: 'parents', id: '1' } } },
        related: {
          parent: {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        },
      },
      {
        id: '3',
        attributes: { name: 'Achilles' },
        links: {},
        redirect: null,
        relationships: { parent: { data: { type: 'parents', id: '1' } } },
        related: {
          parent: {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        },
      },
    ],
    previous: null,
    next: null,
  });
});

test('bulk create', async () => {
  let items;
  axios.request.mockResolvedValue({
    data: {
      data: [
        { type: 'items', id: '1', attributes: { name: 'item 1' } },
        { type: 'items', id: '2', attributes: { name: 'item 2' } },
      ],
    },
  });
  function checks() {
    expectRequestMock({
      method: 'post',
      url: '/items',
      bulk: true,
      data: {
        data: [
          { type: 'items', attributes: { name: 'item 1' } },
          { type: 'items', attributes: { name: 'item 2' } },
        ],
      },
    });
    expect(items).toEqual({
      _API: api,
      _url: '',
      data: [
        { attributes: { name: 'item 1' }, id: '1', type: 'items' },
        { attributes: { name: 'item 2' }, id: '2', type: 'items' },
      ],
      _params: null,
      previous: null,
      next: null,
    });
  }

  items = await api.Item.bulkCreate([
    new api.Item({ name: 'item 1' }),
    new api.Item({ name: 'item 2' }),
  ]);
  checks();

  items = await api.Item.bulkCreate([
    { type: 'items', attributes: { name: 'item 1' } },
    { type: 'items', attributes: { name: 'item 2' } },
  ]);
  checks();
});

test('bulk delete', async () => {
  let result;
  axios.request.mockResolvedValue({});
  function checks() {
    expect(result).toBe(2);
    expectRequestMock({
      method: 'delete',
      url: '/items',
      bulk: true,
      data: { data: [{ type: 'items', id: '1' }, { type: 'items', id: '2' }] },
    });
  }

  result = await api.Item.bulkDelete(['1', '2']);
  checks();

  result = await api.Item.bulkDelete([
    { type: 'items', id: '1' },
    { type: 'items', id: '2' },
  ]);
  checks();

  result = await api.Item.bulkDelete([
    new api.Item({ id: '1' }),
    new api.Item({ id: '2' }),
  ]);
  checks();
});

test('bulk update', async () => {
  let children;
  axios.request.mockResolvedValue({
    data: {
      data: [
        {
          type: 'children',
          id: '1',
          attributes: { name: 'Hercules' },
          relationships: { data: { type: 'parents', id: '1' } },
        },
        {
          type: 'children',
          id: '2',
          attributes: { name: 'Achilles' },
          relationships: { data: { type: 'parents', id: '2' } },
        },
      ],
    },
  });
  const zeus = new api.Parent({ id: '1', name: 'Zeus' });
  const apollo = new api.Parent({ id: '2', name: 'Apollo' });

  function checkCollection() {
    expect(children).toEqual({
      _API: api,
      _url: '',
      data: [
        {
          attributes: { name: 'Hercules' },
          id: '1',
          relationships: { data: { type: 'parents', id: '1' } },
          type: 'children',
        },
        {
          attributes: { name: 'Achilles' },
          id: '2',
          relationships: { data: { type: 'parents', id: '2' } },
          type: 'children',
        },
      ],
      _params: null,
      previous: null,
      next: null,
    });
  }

  children = await api.Child.bulkUpdate(
    [
      new api.Child({ id: '1', name: 'Hercules', parent: zeus }),
      new api.Child({ id: '2', name: 'Achilles', parent: apollo }),
    ],
    ['name'],
  );
  expectRequestMock({
    method: 'patch',
    url: '/children',
    bulk: true,
    data: {
      data: [
        { type: 'children', id: '1', attributes: { name: 'Hercules' } },
        { type: 'children', id: '2', attributes: { name: 'Achilles' } },
      ],
    },
  });
  checkCollection();

  children = await api.Child.bulkUpdate(
    [
      new api.Child({ id: '1', name: 'Hercules', parent: zeus }),
      new api.Child({ id: '2', name: 'Achilles', parent: apollo }),
    ],
    ['parent'],
  );
  expectRequestMock({
    method: 'patch',
    url: '/children',
    bulk: true,
    data: {
      data: [
        {
          type: 'children',
          id: '1',
          relationships: { parent: { data: { type: 'parents', id: '1' } } },
        },
        {
          type: 'children',
          id: '2',
          relationships: { parent: { data: { type: 'parents', id: '2' } } },
        },
      ],
    },
  });
  checkCollection();
});

function checkSetRelated(item, props) {
  expect(item).toEqual({
    id: null,
    attributes: {},
    links: {},
    redirect: null,
    ...props,
  });
}

test('_setRelated null', () => {
  const child = new api.Child();
  child._setRelated('parent', null);
  checkSetRelated(
    child,
    { relationships: { parent: null }, related: { parent: null } },
  );
});

test('_setRelated singular relationship', () => {
  let child;

  child = new api.Child();
  child._setRelated('parent', { type: 'parents', id: '1' });
  checkSetRelated(child, {
    relationships: { parent: { data: { type: 'parents', id: '1' } } },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });

  child = new api.Child();
  child._setRelated('parent', { data: { type: 'parents', id: '1' } });
  checkSetRelated(child, {
    relationships: { parent: { data: { type: 'parents', id: '1' } } },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });

  child = new api.Child();
  child._setRelated(
    'parent',
    {
      data: { type: 'parents', id: '1' },
      links: { self: 'self', related: 'related' },
    },
  );
  checkSetRelated(child, {
    relationships: {
      parent: {
        data: { type: 'parents', id: '1' },
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      parent: {
        id: '1',
        attributes: {},
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });
});

test('_setRelated singular relationship with included parent', () => {
  const includedMap = {
    parents__1: new api.Parent({ id: '1', name: 'the parent' }),
  };
  let child;
  child = new api.Child();
  child._setRelated('parent', { type: 'parents', id: '1' }, includedMap);
  checkSetRelated(child, {
    relationships: { parent: { data: { type: 'parents', id: '1' } } },
    related: {
      parent: {
        id: '1',
        attributes: { name: 'the parent' },
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });

  child = new api.Child();
  child._setRelated(
    'parent',
    { data: { type: 'parents', id: '1' } },
    includedMap,
  );
  checkSetRelated(child, {
    relationships: { parent: { data: { type: 'parents', id: '1' } } },
    related: {
      parent: {
        id: '1',
        attributes: { name: 'the parent' },
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });

  child = new api.Child();
  child._setRelated(
    'parent',
    {
      data: { type: 'parents', id: '1' },
      links: { self: 'self', related: 'related' },
    },
    includedMap,
  );
  checkSetRelated(child, {
    relationships: {
      parent: {
        data: { type: 'parents', id: '1' },
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      parent: {
        id: '1',
        attributes: { name: 'the parent' },
        links: {},
        redirect: null,
        relationships: {},
        related: {},
      },
    },
  });
});

test('_setRelated plural relationship empty array', () => {
  const parent = new api.Parent();
  parent._setRelated('children', []);
  checkSetRelated(parent, {
    relationships: { children: { data: [] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship arrays of resource identifiers', () => {
  let parent;

  parent = new api.Parent();
  parent._setRelated('children', [{ type: 'children', id: '1' }]);
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: {},
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship data field with resource identifiers', () => {
  let parent;

  parent = new api.Parent();
  parent._setRelated('children', { data: [] });
  checkSetRelated(parent, {
    relationships: { children: { data: [] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated('children', { data: [{ type: 'children', id: '1' }] });
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: {},
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    { data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }] },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship links field only', () => {
  const parent = new api.Parent();
  parent._setRelated(
    'children',
    { links: { self: 'self', related: 'related' } },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        links: { self: 'self', related: 'related' },
      },
    },
    related: {},
  });
});

test('_setRelated plural relationship links and data fields with resource identifiers', () => {
  let parent;

  parent = new api.Parent();
  parent._setRelated(
    'children',
    { data: [], links: { self: 'self', related: 'related' } },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [{ type: 'children', id: '1' }],
      links: { self: 'self', related: 'related' },
    },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [{
          id: '1',
          attributes: {},
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
      links: { self: 'self', related: 'related' },
    },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [
          {
            id: '1',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: {},
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship arrays of resource objects', () => {
  let parent;

  parent = new api.Parent();
  parent._setRelated('children', [new api.Child({ id: '1', name: 'child 1' })]);
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: { name: 'child 1' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    [
      new api.Child({ id: '1', name: 'child 1' }),
      new api.Child({ id: '2', name: 'child 2' }),
    ],
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: { name: 'child 1' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 2' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship data field with resource objects', () => {
  let parent;

  parent = new api.Parent();
  parent._setRelated(
    'children',
    { data: [new api.Child({ id: '1', name: 'child 1' })] },
  );
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: { name: 'child 1' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [
        new api.Child({ id: '1', name: 'child 1' }),
        new api.Child({ id: '2', name: 'child 2' }),
      ],
    },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: { name: 'child 1' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 2' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship links and data fields with resource objects', () => {
  let parent;

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [new api.Child({ id: '1', name: 'child 1' })],
      links: { self: 'self', related: 'related' },
    },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [{
          id: '1',
          attributes: { name: 'child 1' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [
        new api.Child({ id: '1', name: 'child 1' }),
        new api.Child({ id: '2', name: 'child 2' }),
      ],
      links: { self: 'self', related: 'related' },
    },
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [
          {
            id: '1',
            attributes: { name: 'child 1' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 2' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship arrays of resource identifiers with includedMap', () => {
  const includedMap = {
    children__1: new api.Child({ id: '1', name: 'child 1' }),
    children__2: new api.Child({ id: '2', name: 'child 2' }),
  };
  let parent;

  parent = new api.Parent();
  parent._setRelated('children', [{ type: 'children', id: '1' }], includedMap);
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: { name: 'child 1' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: { name: 'child 1' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 2' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship data field with resource identifiers with includedMap', () => {
  const includedMap = {
    children__1: new api.Child({ id: '1', name: 'child 1' }),
    children__2: new api.Child({ id: '2', name: 'child 2' }),
  };
  let parent;

  parent = new api.Parent();
  parent._setRelated('children', { data: [] }, includedMap);
  checkSetRelated(parent, {
    relationships: { children: { data: [] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated('children', { data: [{ type: 'children', id: '1' }] }, includedMap);
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: { name: 'child 1' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    { data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }] },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: { name: 'child 1' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 2' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship links and data fields with resource identifiers with includedMap', () => {
  const includedMap = {
    children__1: new api.Child({ id: '1', name: 'child 1' }),
    children__2: new api.Child({ id: '2', name: 'child 2' }),
  };
  let parent;

  parent = new api.Parent();
  parent._setRelated(
    'children',
    { data: [], links: { self: 'self', related: 'related' } },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [{ type: 'children', id: '1' }],
      links: { self: 'self', related: 'related' },
    },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [{
          id: '1',
          attributes: { name: 'child 1' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
      links: { self: 'self', related: 'related' },
    },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [
          {
            id: '1',
            attributes: { name: 'child 1' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 2' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship arrays of resource objects with includedMap', () => {
  const includedMap = {
    children__1: new api.Child({ id: '1', name: 'child 3' }),
    children__2: new api.Child({ id: '2', name: 'child 4' }),
  };
  let parent;

  parent = new api.Parent();
  parent._setRelated('children', [new api.Child({ id: '1', name: 'child 1' })], includedMap);
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: { name: 'child 3' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    [
      new api.Child({ id: '1', name: 'child 1' }),
      new api.Child({ id: '2', name: 'child 2' }),
    ],
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: { name: 'child 3' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 4' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship data field with resource objects with includedMap', () => {
  const includedMap = {
    children__1: new api.Child({ id: '1', name: 'child 3' }),
    children__2: new api.Child({ id: '2', name: 'child 4' }),
  };
  let parent;

  parent = new api.Parent();
  parent._setRelated(
    'children',
    { data: [new api.Child({ id: '1', name: 'child 1' })] },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: { children: { data: [{ type: 'children', id: '1' }] } },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [{
          id: '1',
          attributes: { name: 'child 3' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [
        new api.Child({ id: '1', name: 'child 1' }),
        new api.Child({ id: '2', name: 'child 2' }),
      ],
    },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [
          { type: 'children', id: '1' },
          { type: 'children', id: '2' },
        ],
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: null,
        data: [
          {
            id: '1',
            attributes: { name: 'child 3' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 4' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('_setRelated plural relationship links and data fields with resource objects with includedMap', () => {
  const includedMap = {
    children__1: new api.Child({ id: '1', name: 'child 3' }),
    children__2: new api.Child({ id: '2', name: 'child 4' }),
  };
  let parent;

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [new api.Child({ id: '1', name: 'child 1' })],
      links: { self: 'self', related: 'related' },
    },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [{
          id: '1',
          attributes: { name: 'child 3' },
          links: {},
          redirect: null,
          relationships: {},
          related: {},
        }],
        next: null,
        previous: null,
      },
    },
  });

  parent = new api.Parent();
  parent._setRelated(
    'children',
    {
      data: [
        new api.Child({ id: '1', name: 'child 1' }),
        new api.Child({ id: '2', name: 'child 2' }),
      ],
      links: { self: 'self', related: 'related' },
    },
    includedMap,
  );
  checkSetRelated(parent, {
    relationships: {
      children: {
        data: [{ type: 'children', id: '1' }, { type: 'children', id: '2' }],
        links: { self: 'self', related: 'related' },
      },
    },
    related: {
      children: {
        _API: api,
        _params: null,
        _url: 'related',
        data: [
          {
            id: '1',
            attributes: { name: 'child 3' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
          {
            id: '2',
            attributes: { name: 'child 4' },
            links: {},
            redirect: null,
            relationships: {},
            related: {},
          },
        ],
        next: null,
        previous: null,
      },
    },
  });
});

test('reloading does not overwrite pre-fetched relationship (singular)', () => {
  const parent = new api.Parent({ id: '2', name: 'the parent' });
  const child = new api.Child({ id: '1', parent });
  child._overwrite({ id: '2', parent: parent.asResourceIdentifier() });
  expect(child.get('parent').get('name')).toEqual('the parent');
});

test('reloading does not overwrite pre-fetched relationship (plural)', () => {
  const child1 = new api.Child({ id: '1', name: 'child 1' });
  const child2 = new api.Child({ id: '2', name: 'child 2' });
  const parent = new api.Parent({ id: '3', children: [child1, child2] });
  parent._overwrite({
    id: '3',
    children: [child1.asResourceIdentifier(), child2.asResourceIdentifier()],
  });
  expect(parent.get('children').data[0].get('name')).toEqual('child 1');
  expect(parent.get('children').data[1].get('name')).toEqual('child 2');
});
