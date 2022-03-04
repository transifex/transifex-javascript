/* globals jest test expect */

const typeis = require('type-is');

const { tx } = require('@transifex/native');

const {
  TxExpress,
  CookieMode,
  SignedCookieMode,
  SessionMode,
} = require('../src');

jest.mock('type-is');

test('TxExpress default values', () => {
  const txExpress = new TxExpress();

  // Ideally this should work but the functions are not considered equal and we
  // have no data members to compare
  // expect(txExpress.mode).toEqual(CookieMode());

  expect(txExpress.fallBackToAcceptLanguage).toBe(true);
  expect(txExpress.sourceLocale).toBe('en');
  expect(txExpress.daemon).toBe(true);
  expect(txExpress.ttl).toBe(10 * 60);
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
  let txExpress = new TxExpress(customOptions);
  expect(txExpress).toEqual(customOptions);

  txExpress = new TxExpress();
  txExpress.setup(customOptions);
  expect(txExpress).toEqual(customOptions);
});

test('Middleware with cookies', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  tx.languages = languages;
  tx.cache.update('fr', { foo: 'translation' });

  const txExpress = new TxExpress({ mode: CookieMode({ name: 'tx-locale' }) });
  const req = {
    cookies: { 'tx-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.tx];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  txExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('Middleware with signed cookies', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  tx.languages = languages;
  tx.cache.update('fr', { foo: 'translation' });

  const txExpress = new TxExpress({ mode: SignedCookieMode({ name: 'tx-locale' }) });
  const req = {
    signedCookies: { 'tx-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.tx];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  txExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('Middleware with sessions', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  tx.languages = languages;
  tx.cache.update('fr', { foo: 'translation' });

  const txExpress = new TxExpress({ mode: SessionMode({ name: 'tx-locale' }) });
  const req = {
    session: { 'tx-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.tx];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  txExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('Middleware falls back to header', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  tx.languages = languages;
  tx.locales = ['en', 'fr'];
  tx.cache.update('fr', { foo: 'translation' });

  const txExpress = new TxExpress({ mode: CookieMode({ name: 'tx-locale' }) });
  const req = {
    cookies: {},
    headers: { 'accept-language': 'de, en;q=0.6, fr;q=0.8' },
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.tx];
    },
  };
  let nextCalled = false;
  function next() { nextCalled = true; }

  txExpress.middleware()(req, res, next);

  expect(req.t('foo', { _key: 'foo' })).toBe('translation');
  expect(res.render()).toEqual(['translation', { languages, currentLocale: 'fr' }]);
  expect(nextCalled).toBe(true);
});

test('setLocale with cookie and form with next', () => {
  typeis.mockReturnValue(false);

  const txExpress = new TxExpress({ mode: CookieMode({ name: 'tx-locale' }) });
  const req = {
    body: { locale: 'fr', next: 'next' },
  };
  let redirectTo = '';
  const res = {
    cookies: {},
    cookie(key, value) { this.cookies[key] = value; },
    redirect(path) { redirectTo = path; },
  };

  txExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'tx-locale': 'fr' });
  expect(redirectTo).toBe('next');
});

test('setLocale with cookie and form without next', () => {
  typeis.mockReturnValue(false);

  const txExpress = new TxExpress({ mode: CookieMode({ name: 'tx-locale' }) });
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

  txExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'tx-locale': 'fr' });
  expect(redirectTo).toBe('referer');
});

test('setLocale with cookie and cookie options and form with next', () => {
  typeis.mockReturnValue(false);

  const txExpress = new TxExpress({
    mode: CookieMode({ name: 'tx-locale', cookieOptions: { some: 'option' } }),
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

  txExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'tx-locale': 'fr' });
  expect(cookieOptions).toEqual({ some: 'option' });
  expect(redirectTo).toBe('next');
});

test('setLocale with cookie and json', () => {
  typeis.mockReturnValue(true);

  const txExpress = new TxExpress({ mode: CookieMode({ name: 'tx-locale' }) });
  const req = {
    body: { locale: 'fr' },
  };
  let jsonResponse = {};
  const res = {
    cookies: {},
    cookie(key, value) { this.cookies[key] = value; },
    json(data) { jsonResponse = data; },
  };

  txExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'tx-locale': 'fr' });
  expect(jsonResponse).toEqual({ status: 'success' });
});

test('setLocale with signed cookie and form with next', () => {
  typeis.mockReturnValue(false);

  const txExpress = new TxExpress({ mode: SignedCookieMode({ name: 'tx-locale' }) });
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

  txExpress.setLocale()(req, res);

  expect(res.cookies).toEqual({ 'tx-locale': 'fr' });
  expect(cookieOptions).toEqual({ signed: true });
  expect(redirectTo).toBe('next');
});

test('setLocale with session and form with next', () => {
  typeis.mockReturnValue(false);

  const txExpress = new TxExpress({ mode: SessionMode({ name: 'tx-locale' }) });
  const req = {
    session: {},
    body: { locale: 'fr', next: 'next' },
  };
  let redirectTo = '';
  const res = {
    redirect(path) { redirectTo = path; },
  };

  txExpress.setLocale()(req, res);

  expect(req.session).toEqual({ 'tx-locale': 'fr' });
  expect(redirectTo).toBe('next');
});

test('t vs ut', () => {
  const languages = [{ code: 'en', name: 'English' }, { code: 'fr', name: 'French' }];
  tx.languages = languages;
  tx.cache.update('fr', { foo: 'A <rich>string</rich>' });

  const txExpress = new TxExpress();
  const req = {
    cookies: { 'tx-locale': 'fr' },
    headers: {},
  };
  const res = {
    render(view, locals) {
      return [locals.t('foo', { _key: 'foo' }), locals.ut('foo', { _key: 'foo' })];
    },
  };

  txExpress.middleware()(req, res, () => {});

  expect(req.t('foo', { _key: 'foo' })).toBe('A &lt;rich&gt;string&lt;/rich&gt;');
  expect(req.ut('foo', { _key: 'foo' })).toBe('A <rich>string</rich>');
  expect(res.render()).toEqual([
    'A &lt;rich&gt;string&lt;/rich&gt;',
    'A <rich>string</rich>',
  ]);
});
