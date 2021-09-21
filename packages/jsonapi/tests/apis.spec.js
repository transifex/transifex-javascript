/* global test expect jest */

import './utils';

import axios from 'axios';

import { JsonApi } from '../src/apis';
import { JsonApiException } from '../src/errors';

jest.mock('axios');

test('JsonApi contructor and setup behave the same', () => {
  let props = { host: 1, auth: 2 };
  let api1 = new JsonApi(props);
  let api2 = new JsonApi();
  api2.setup(props);

  expect(api1.host).toEqual(api2.host);
  expect(api1.auth()).toEqual(api2.auth());

  props = { host: 1, auth: () => 2 };
  api1 = new JsonApi(props);
  api2 = new JsonApi();
  api2.setup(props);

  expect(api1.host).toEqual(api2.host);
  expect(api1.auth()).toEqual(api2.auth());
});

test('JsonApi.register', () => {
  class Api extends JsonApi {
    static HOST = 'api.com';
  }
  class Resource {
    static TYPE = 'resources';
  }
  Api.register(Resource);

  const api = new Api();
  expect(api.Resource).toBeTruthy();
  expect(api.Resource.prototype instanceof Resource).toBeTruthy();
  expect(api.Resource.TYPE).toBe('resources');
  expect(api.Resource.API).toBe(api);
  expect(api.registry.resources).toEqual(api.Resource);
});

test('JsonApi.request with GET', async () => {
  class Api extends JsonApi {
    static HOST = 'https://api.com';
  }
  const api = new Api({ auth: 'MYTOKEN' });
  axios.request.mockResolvedValue(Promise.resolve('mock response'));
  const actualResponse = await api.request({ method: 'get', url: '/path' });
  expect(actualResponse).toBe('mock response');
  expect(axios.request).toHaveBeenCalledWith({
    method: 'get',
    url: 'https://api.com/path',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      Authorization: 'Bearer MYTOKEN',
    },
    maxRedirects: 0,
  });
});

test('JsonApi.request with error', async () => {
  let errorRaised = false;
  class Api extends JsonApi {
    static HOST = 'https://api.com';
  }
  const api = new Api({ auth: 'MYTOKEN' });
  const errors = [
    {
      status: 401,
      code: 'Unauthorized',
      title: 'Authentication error',
      detail: 'Authentication failed',
    },
    {
      status: 400,
      code: 'BaRequest',
      title: 'Bad request',
      detail: '\'filter[project]\' parameter is required',
    },
  ];
  axios.request.mockResolvedValue(Promise.reject({ response: {
    status: 400,
    data: { errors },
  } }));
  try {
    await api.request({ method: 'get', url: 'path' });
  }
  catch (e) {
    errorRaised = true;
    expect(e instanceof JsonApiException).toBeTruthy();
    expect(e).toEqual( new JsonApiException(400, errors) );
  }
  expect(errorRaised).toBeTruthy();
});
