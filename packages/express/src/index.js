const { tx, escape } = require('@transifex/native');
const typeis = require('type-is');

function CookieMode({ name = 'tx-locale', cookieOptions } = {}) {
  return {
    setLocale(req, res, locale) {
      res.cookie(name, locale, cookieOptions);
    },
    getLocale(req) {
      return req.cookies[name];
    },
  };
}

function SignedCookieMode({ name = 'tx-locale', cookieOptions } = {}) {
  return {
    setLocale(req, res, locale) {
      res.cookie(name, locale, { ...cookieOptions, signed: true });
    },
    getLocale(req) {
      return req.signedCookies[name];
    },
  };
}

function SessionMode({ name = 'tx-locale' } = {}) {
  return {
    setLocale(req, res, locale) {
      req.session[name] = locale;
    },
    getLocale(req) {
      return req.session[name];
    },
  };
}

function noop() {}

class TxExpress {
  constructor(options = {}) {
    // https://www.kbairak.net/programming/python/2020/09/16/global-singleton-vs-instance-for-libraries.html
    this.mode = CookieMode();
    this.fallBackToAcceptLanguage = true;
    this.sourceLocale = 'en';
    this.daemon = true;
    this.ttl = 10 * 60;
    this.logging = noop;
    this.setup(options);
  }

  setup({
    mode,
    fallBackToAcceptLanguage,
    sourceLocale,
    daemon,
    ttl,
    logging,
    ...txOptions
  } = {}) {
    if (txOptions) {
      tx.init(txOptions);
    }
    if (mode) {
      this.mode = mode;
    }
    if (fallBackToAcceptLanguage !== undefined) {
      this.fallBackToAcceptLanguage = fallBackToAcceptLanguage;
    }
    if (sourceLocale) {
      this.sourceLocale = sourceLocale;
    }
    if (daemon !== undefined) {
      this.daemon = daemon;
    }
    if (ttl) {
      this.ttl = ttl;
    }
    if (logging) {
      this.logging = logging;
    }
  }

  middleware() {
    return (req, res, next) => {
      let locale = this.mode.getLocale(req, res);

      if (
        !locale
        && this.fallBackToAcceptLanguage
        && req.headers['accept-language']
      ) {
        // The header looks like: 'da, en-gb;q=0.8, en;'
        // Locales without a 'q' value will be considered first, the rest will
        // be sorted based on their q value. After sorting, we will use the
        // first locale that is supported by Transifex Native.
        const locales = req.headers['accept-language']
          .split(',')
          .map((section) => section.trim())
          .map((section) => section.split(';'));
        const localesWithoutQ = locales
          .filter(([, q]) => !q)
          .map(([code]) => code);
        const localesWithQ = locales.filter(([, q]) => !!q)
          .sort(([, left], [, right]) => (
            parseFloat(right.substring(2)) - parseFloat(left.substring(2))
          ))
          .map(([code]) => code);
        const finalLocales = localesWithoutQ.concat(localesWithQ);

        for (let i = 0; i < finalLocales.length; i++) {
          const current = finalLocales[i];
          if (tx.locales.indexOf(current) !== -1) {
            locale = current;
            break;
          }
        }
      }

      if (!locale) { locale = this.sourceLocale; }

      const ut = (...args) => tx.translateLocale(locale, ...args);
      const t = (...args) => escape(ut(...args));

      req.ut = ut;
      req.t = t;

      const oldRender = res.render.bind(res);
      res.render = (view, locals, ...args) => {
        const actualLocals = locals || {};
        Object.assign(actualLocals, {
          ut,
          t,
          tx: { languages: tx.languages, currentLocale: locale },
        });
        return oldRender(view, actualLocals, ...args);
      };

      next();
    };
  }

  setLocale() {
    return (req, res) => {
      const locale = req.body.locale || this.sourceLocale;

      this.mode.setLocale(req, res, locale);
      if (typeis(req, ['json'])) {
        res.json({ status: 'success' });
      } else {
        res.redirect(req.body.next || req.headers.referer);
      }
    };
  }

  async fetch() {
    const _fetch = async () => {
      await tx.getLocales();
      for (let i = 0; i < tx.locales.length; i++) {
        const locale = tx.locales[i];
        /* eslint-disable no-await-in-loop */
        await tx.fetchTranslations(locale);
        /* eslint-enable */
      }
    };

    this.logging('Transifex Native: fetching translations');
    await _fetch();
    this.logging('Transifex Native: done');
    if (this.daemon) {
      setInterval(_fetch, this.ttl * 1000);
    }
  }
}

module.exports = {
  TxExpress,
  CookieMode,
  SignedCookieMode,
  SessionMode,
};
