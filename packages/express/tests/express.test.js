/* globals jest test expect */

const typeis = require('type-is');

const { ws } = require('@wordsmith/native');

const {
  TxExpress,
  CookieMode,
  SignedCookieMode,
  SessionMode,
} = require('../src');

jest.mock('type-is');

test('TxExpress default values', () => {
  const wsExpress = new TxExpress();

  // Ideally this should work but the functions are not considered equal and we
  // have no data members to compare
  // expect(wsExpress.mode).toEqual(CookieMode());

  expect(wsExpress.fallBackToAcceptLanguage).toBe(true);
  expect(wsExpress.sourceLocale).toBe('en');
  expect(wsExpress.daemon).toBe(true);
  expect(wsExpress.ttl).toBe(10 * 60);
});

test('TxExpress custom values', () => {
  const customOptions = {
    mode: 'other',
    fallBackToAcceptLanguage: false,
    sourceLocale: 'other',
    daemon: false,
    ttl: 3,
    logging: 'other',
  };
  let wsExpress = new TxExpress(customOptions);
  expect(wsExpress).toEqual(customOptions);

  wsExpress = new TxExpress();
  wsExpress.setup(customOptions);
  expect(wsExpress).toEqual(customOptions);
});

test('Middleware with cookies', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  ws.languages = languages;
  ws.cache.update('fr', { foo: 'translation' });

  const wsExpress = new TxExpress({ mode: CookieMode({ name: 'ws-locale' }) });
  const req = {
    cookies: { 'ws-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.ws];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  wsExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('Middleware with signed cookies', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  ws.languages = languages;
  ws.cache.update('fr', { foo: 'translation' });

  const wsExpress = new TxExpress({ mode: SignedCookieMode({ name: 'ws-locale' }) });
  const req = {
    signedCookies: { 'ws-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.ws];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  wsExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('Middleware with sessions', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  ws.languages = languages;
  ws.cache.update('fr', { foo: 'translation' });

  const wsExpress = new TxExpress({ mode: SessionMode({ name: 'ws-locale' }) });
  const req = {
    session: { 'ws-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.ws];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  wsExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('Middleware falls back to header', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  ws.languages = languages;
  ws.locales = ['en', 'fr'];
  ws.cache.update('fr', { foo: 'translation' });

  const wsExpress = new TxExpress({ mode: CookieMode({ name: 'ws-locale' }) });
  const req = {
    cookies: {},
    headers: { 'accept-language': 'de, en;q=0.6, fr;q=0.8' },
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.ws];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  wsExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('setLocale with cookie and form with next', () => {
  typeis.mockReturnValue(false);

  const wsExpress = new TxExpress({ mode: CookieMode({ name: 'ws-locale' }) });
  const req = {
    body: { locale: 'fr', next: 'next' },
  };
  let redirectTo = '';
  const res = {
    cookies: {},
    cookie(key, value) { this.cookies[key] = value; },
    redirect(path) { redirectTo = path; },
  };

  wsExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'ws-locale': 'fr' });
  expect(redirectTo).toBe('next');
});

test('setLocale with cookie and form without next', () => {
  typeis.mockReturnValue(false);

  const wsExpress = new TxExpress({ mode: CookieMode({ name: 'ws-locale' }) });
  const req = {
    body: { locale: 'fr' },
    headers: { referer: 'referer' },
  };
  let redirectTo = '';
  const res = {
    cookies: {},
    cookie(key, value) { this.cookies[key] = value; },
    redirect(path) { redirectTo = path; },
  };

  wsExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'ws-locale': 'fr' });
  expect(redirectTo).toBe('referer');
});

test('setLocale with cookie and cookie options and form with next', () => {
  typeis.mockReturnValue(false);

  const wsExpress = new TxExpress({
    mode: CookieMode({ name: 'ws-locale', cookieOptions: { some: 'option' } }),
  });
  const req = {
    body: { locale: 'fr', next: 'next' },
  };
  let cookieOptions = {};
  let redirectTo = '';
  const res = {
    cookies: {},
    cookie(key, value, options) {
      this.cookies[key] = value;
      cookieOptions = options;
    },
    redirect(path) { redirectTo = path; },
  };

  wsExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'ws-locale': 'fr' });
  expect(cookieOptions).toEqual({ some: 'option' });
  expect(redirectTo).toBe('next');
});

test('setLocale with cookie and json', () => {
  typeis.mockReturnValue(true);

  const wsExpress = new TxExpress({ mode: CookieMode({ name: 'ws-locale' }) });
  const req = {
    body: { locale: 'fr' },
  };
  let jsonResponse = {};
  const res = {
    cookies: {},
    cookie(key, value) { this.cookies[key] = value; },
    json(data) { jsonResponse = data; },
  };

  wsExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'ws-locale': 'fr' });
  expect(jsonResponse).toEqual({ status: 'success' });
});

test('setLocale with signed cookie and form with next', () => {
  typeis.mockReturnValue(false);

  const wsExpress = new TxExpress({ mode: SignedCookieMode({ name: 'ws-locale' }) });
  const req = {
    body: { locale: 'fr', next: 'next' },
  };
  let cookieOptions = {};
  let redirectTo = '';
  const res = {
    cookies: {},
    cookie(key, value, options) {
      this.cookies[key] = value;
      cookieOptions = options;
    },
    redirect(path) { redirectTo = path; },
  };

  wsExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'ws-locale': 'fr' });
  expect(cookieOptions).toEqual({ signed: true });
  expect(redirectTo).toBe('next');
});

test('setLocale with session and form with next', () => {
  typeis.mockReturnValue(false);

  const wsExpress = new TxExpress({ mode: SessionMode({ name: 'ws-locale' }) });
  const req = {
    session: {},
    body: { locale: 'fr', next: 'next' },
  };
  let redirectTo = '';
  const res = {
    redirect(path) { redirectTo = path; },
  };

  wsExpress.setLocale()(req, res);

  expect(req.session).toEqual({ 'ws-locale': 'fr' });
  expect(redirectTo).toBe('next');
});

test('t vs ut', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  ws.languages = languages;
  ws.cache.update('fr', { foo: 'A <rich>string</rich>' });

  const wsExpress = new TxExpress();
  const req = {
    cookies: { 'ws-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.ut('foo', { _key: 'foo' })];
    },
  };

  wsExpress.middleware()(req, res, () => {});

  expect(req.t('foo', { _key: 'foo' })).toBe('A &lt;rich&gt;string&lt;/rich&gt;');
  expect(req.ut('foo', { _key: 'foo' })).toBe('A <rich>string</rich>');
  expect(res.render()).toEqual([
    'A &lt;rich&gt;string&lt;/rich&gt;',
    'A <rich>string</rich>',
  ]);
});
