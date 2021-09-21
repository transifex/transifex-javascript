/* global test jest expect */

import axios from 'axios';

import Collection from '../src/collections';
import { DoesNotExist, MultipleObjectsReturned } from '../src/errors';
import { api, expectRequestMock } from './utils';

jest.mock('axios');

function testItem(id, attributes = {}) {
  return {
    id,
    attributes,
    links: {},
    redirect: null,
    relationships: {},
    related: {},
  };
}

test('list', async () => {
  let collection;
  async function testList() {
    axios.request.mockResolvedValue(Promise.resolve({ data: { data: [
      { type: 'items', id: '1', attributes: { name: 'item 1' } },
      { type: 'items', id: '2', attributes: { name: 'item 2' } },
    ] } }));
    await collection.fetch();

    expectRequestMock({ method: 'get', url: '/items', params: null });
    expect(collection).toEqual({
      _API: api,
      _url: '/items',
      _params: null,
      data: [
        testItem('1', { name: 'item 1' }),
        testItem('2', { name: 'item 2' }),
      ],
      next: null,
      previous: null,
    });
  }

  collection = new Collection(api, '/items');
  await testList(collection);

  collection = api.Item.list();
  await testList(collection);
});

test('pagination', async () => {
  const page1 = api.Item.list();
  const response1 = Promise.resolve({ data: {
    data: [{ type: 'items', id: '1' }, { type: 'items', id: '2' }],
    links: { next: '/items?page=2' },
  } });
  axios.request.mockResolvedValue(response1);
  await page1.fetch();
  const response2 = Promise.resolve({ data: {
    data: [{ type: 'items', id: '3' }, { type: 'items', id: '4' }],
    links: { previous: '/items' },
  } });
  axios.request.mockResolvedValue(response2);
  const page2 = await page1.getNext();
  expect(page2).toEqual({
    _API: api,
    _url: '/items?page=2',
    _params: null,
    data: [testItem('3'), testItem('4')],
    next: null,
    previous: '/items',
  });
  axios.request.mockResolvedValue(Promise.resolve(response1));
  const newPage1 = await page2.getPrevious();
  expect(newPage1).toEqual(page1);
});

async function testParams(items, params) {
  axios.request.mockResolvedValue(Promise.resolve({ data: { data: [] } }));
  await items.fetch();
  expectRequestMock({ method: 'get', url: '/items', params });
  expect(items).toEqual({
    _API: api,
    _url: '/items',
    _params: params,
    data: [],
    next: null,
    previous: null,
  });
}

test('extra', async () => {
  const items = api.Item.list().extra({ a: 'b' });
  await testParams(items, { a: 'b' });
});

test('filter', async () => {
  let items;

  items = api.Item.list().filter({ a: 'b', c__d: 'e' });
  await testParams(items, { 'filter[a]': 'b', 'filter[c][d]': 'e' });

  items = api.Item.filter({ a: 'b', c__d: 'e' });
  await testParams(items, { 'filter[a]': 'b', 'filter[c][d]': 'e' });

  items = api.Item.filter({ parent: new api.Parent({ id: '1' }) });
  await testParams(items, { 'filter[parent]': '1' });
});

test('page single argument', async () => {
  let items;

  items = api.Item.list().page('1');
  await testParams(items, { page: '1' });

  items = api.Item.page('1');
  await testParams(items, { page: '1' });
});

test('page object argument', async () => {
  let items;

  items = api.Item.list().page({ a: 'b', c: 'd' });
  await testParams(items, { 'page[a]': 'b', 'page[c]': 'd' });

  items = api.Item.page({ a: 'b', c: 'd' });
  await testParams(items, { 'page[a]': 'b', 'page[c]': 'd' });
});

test('include', async () => {
  let items;

  items = api.Item.list().include('a');
  await testParams(items, { include: 'a' });

  items = api.Item.include('a');
  await testParams(items, { include: 'a' });

  items = api.Item.list().include('a', 'b');
  await testParams(items, { include: 'a,b' });

  items = api.Item.include('a', 'b');
  await testParams(items, { include: 'a,b' });
});

test('include with response', async () => {
  const children = api.Child.include('parent');
  axios.request.mockResolvedValue(Promise.resolve({ data: {
    data: [
      {
        type: 'children',
        id: '1',
        relationships: { parent: { data: { type: 'parents', id: '3' } } },
      },
      {
        type: 'children',
        id: '2',
        relationships: { parent: { data: { type: 'parents', id: '4' } } },
      },
    ],
    included: [
      { type: 'parents', id: '3', attributes: { name: 'Zeus' } },
      { type: 'parents', id: '4', attributes: { name: 'Hera' } },
    ],
  } }));
  await children.fetch();
  expect(children.data[0].get('parent').get('name')).toEqual('Zeus');
  expect(children.data[1].get('parent').get('name')).toEqual('Hera');
});

test('sort', async () => {
  let items;

  items = api.Item.list().sort('a');
  await testParams(items, { sort: 'a' });

  items = api.Item.sort('a');
  await testParams(items, { sort: 'a' });

  items = api.Item.list().sort('a', 'b');
  await testParams(items, { sort: 'a,b' });

  items = api.Item.sort('a', 'b');
  await testParams(items, { sort: 'a,b' });
});

test('fields', async () => {
  let items;

  items = api.Item.list().fields('a');
  await testParams(items, { fields: 'a' });

  items = api.Item.fields('a');
  await testParams(items, { fields: 'a' });

  items = api.Item.list().fields('a', 'b');
  await testParams(items, { fields: 'a,b' });

  items = api.Item.fields('a', 'b');
  await testParams(items, { fields: 'a,b' });
});

test('get', async () => {
  let item;

  function before() {
    axios.request.mockResolvedValue(Promise.resolve({ data: { data: [
      {
        type: 'items',
        id: '1',
        attributes: { name: 'item 1', created: 'yesterday' },
      },
    ] } }));
  }

  function after() {
    expectRequestMock({
      method: 'get',
      url: '/items',
      params: { 'filter[name]': 'item 1' },
    });
    expect(item).toEqual(
      testItem('1', { name: 'item 1', created: 'yesterday' }),
    );
  }

  before();
  item = await api.Item.list().get({ name: 'item 1' });
  after();

  before();
  item = await api.Item.get({ name: 'item 1' });
  after();
});

test('get with errors', async () => {
  let errorRaised;

  axios.request.mockResolvedValue(Promise.resolve({ data: { data: [] } }));
  errorRaised = false;
  try {
    await api.Item.get();
  } catch (e) {
    if (e instanceof DoesNotExist) {
      errorRaised = true;
    }
  }
  expect(errorRaised).toBeTruthy();

  axios.request.mockResolvedValue(Promise.resolve({
    data: {
      data: [
        { type: 'items', id: '1' }, { type: 'items', id: '2' },
      ],
    },
  }));
  errorRaised = false;
  try {
    await api.Item.get();
  } catch (e) {
    if (e instanceof MultipleObjectsReturned) {
      errorRaised = true;
    }
  }
  expect(errorRaised).toBeTruthy();
});

test('fetch plural relationship', async () => {
  const parent = new api.Parent({
    id: '1', children: { links: { related: '/parents/1/children' } } ,
  });
  const children = await parent.fetch('children');
  axios.request.mockResolvedValue(Promise.resolve({ data: { data: [
    { type: 'children', id: '1' },
    { type: 'children', id: '2' },
  ] } }));
  await children.fetch();
  expectRequestMock({
    method: 'get',
    url: '/parents/1/children',
    params: null,
  });
  expect(children).toEqual({
    _API: api,
    _url: '/parents/1/children',
    _params: null,
    data: [testItem('1'), testItem('2')],
    previous: null,
    next: null,
  });
});

test('fetch plural relationship and apply filters', async () => {
  const parent = new api.Parent({
    id: '1', children: { links: { related: '/parents/1/children' } } ,
  });
  const children = (await parent.fetch('children')).filter({ a: 'b' });
  axios.request.mockResolvedValue(Promise.resolve({ data: { data: [
    { type: 'children', id: '1' },
    { type: 'children', id: '2' },
  ] } }));
  await children.fetch();
  expectRequestMock({
    method: 'get',
    url: '/parents/1/children',
    params: { 'filter[a]': 'b' },
  });
  expect(children).toEqual({
    _API: api,
    _url: '/parents/1/children',
    _params: { 'filter[a]': 'b' },
    data: [testItem('1'), testItem('2')],
    previous: null,
    next: null,
  });
});

test('`allPages` generator', async () => {
  const list = api.Item.list();
  const response1 = Promise.resolve({ data: {
    data: [{ type: 'items', id: '1' }, { type: 'items', id: '2' }],
    links: { next: '/items?page=2' },
  } });
  const response2 = Promise.resolve({ data: {
    data: [{ type: 'items', id: '3' }, { type: 'items', id: '4' }],
    links: { previous: '/items' },
  } });
  axios.request.
    mockResolvedValueOnce(response1).
    mockResolvedValueOnce(response2);
  const result = [];
  for await (const page of list.allPages()) {
    result.push(page);
  }
  expect(result).toEqual([
    {
      _API: api,
      _url: '/items',
      _params: null,
      data: [testItem('1'), testItem('2')],
      next: '/items?page=2',
      previous: null,
    },
    {
      _API: api,
      _url: '/items?page=2',
      _params: null,
      data: [testItem('3'), testItem('4')],
      next: null,
      previous: '/items',
    }
  ]);
});

test('`all` generator', async () => {
  const response1 = Promise.resolve({ data: {
    data: [{ type: 'items', id: '1' }, { type: 'items', id: '2' }],
    links: { next: '/items?page=2' },
  } });
  const response2 = Promise.resolve({ data: {
    data: [{ type: 'items', id: '3' }, { type: 'items', id: '4' }],
    links: { previous: '/items' },
  } });
  axios.request.
    mockResolvedValueOnce(response1).
    mockResolvedValueOnce(response2);
  const result = [];
  const page = api.Item.list();
  for await (const item of page.all()) {
    result.push(item);
  }
  expect(result).toEqual([
    testItem('1'),
    testItem('2'),
    testItem('3'),
    testItem('4'),
  ]);
});
