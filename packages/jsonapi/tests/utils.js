/* global expect */

import axios from 'axios';

import Resource from '../src/resources';
import JsonApi from '../src/apis';

export class Api extends JsonApi {
  static HOST = 'https://api.families.com';
}
export class Item extends Resource {
  static TYPE = 'items';
}
Api.register(Item, 'Item');
export class Child extends Resource {
  static TYPE = 'children';
}
Api.register(Child, 'Child');
export class Parent extends Resource {
  static TYPE = 'parents';
}
Api.register(Parent, 'Parent');
export const api = new Api({ auth: 'MYTOKEN' });

export function expectRequestMock({ url, bulk = false, ...props }) {
  const headers = { Authorization: 'Bearer MYTOKEN' };
  if (bulk) {
    headers['Content-Type'] = 'application/vnd.api+json;profile="bulk"';
  }
  else {
    headers['Content-Type'] = 'application/vnd.api+json';
  }
  expect(axios.request).toHaveBeenCalledWith({
    url: 'https://api.families.com' + url,
    headers,
    maxRedirects: 0,
    ...props
  });
}
