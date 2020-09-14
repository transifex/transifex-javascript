import md5 from 'md5';

/**
 * Generate a string key
 *
 * @export
 * @param {String} string
 * @param {Object} options
 * @returns {String} key
 */
export function generateKey(string, options = {}) {
  if (options._key) return options._key;

  let context = '';
  if (options._context) {
    context = options._context;
    context = context.replace(/,/g, ':');
  }
  return md5(`5:${string}:${context}`);
}

/**
 * Escape HTML string
 *
 * @export
 * @param {String} unsafe
 * @returns {String} safe
 */
export function escape(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if passed parameter is String
 *
 * @export
 * @param {*} obj
 * @returns {Boolean}
 */
export function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

/**
 * Convert a locale to Transifex locale format, e.g
 * pt-br -> pt_BR
 *
 * @export
 * @param {String} locale
 * @returns {String} normalizedLocale
 */
export function normalizeLocale(locale) {
  const parts = locale.split('-');
  let normalizedLocale;
  if (parts.length === 1) {
    normalizedLocale = locale;
  } else {
    normalizedLocale = [parts[0], parts[1].toUpperCase()].join('_');
  }
  return normalizedLocale;
}

const PLURAL_RULES = ['zero', 'one', 'two', 'few', 'many', 'other'];

function _consumePreamble(string) {
  if (!(string.length > 1
      && string[0] === '{'
      && string[string.length - 1] === '}')
  ) {
    return [null, null];
  }

  // {cnt, plural, one {foo} other {foos}}
  //  ^^^^^^^^^^^
  const firstCommaPos = string.indexOf(',');
  if (firstCommaPos === -1) { return [null, null]; }
  const secondCommaPos = string.indexOf(',', firstCommaPos + 1);
  if (secondCommaPos === -1) { return [null, null]; }

  const varName = string.substring(1, firstCommaPos).trim();
  const keyword = string
    .substring(firstCommaPos + 1, secondCommaPos)
    .trim();

  // Make sure `keyword` is 'plural'
  if (keyword !== 'plural') { return [null, null]; }

  return [
    varName,
    string.substring(secondCommaPos + 1, string.length - 1).trim()];
}

function _consumeRule(string) {
  // {cnt, plural, one {foo} other {foos}}
  //              ^^^^^
  const leftBracketPos = string.indexOf('{');
  if (leftBracketPos === -1) { return [null, null]; }
  let rule = string.substring(0, leftBracketPos).trim();
  if (rule[0] === '=') {
    rule = rule.substring(1);
    if (!Number.isNaN(parseInt(rule, 10)) && parseInt(rule, 10) === parseFloat(rule)) {
      rule = parseInt(rule, 10);
      rule = PLURAL_RULES[rule];
      if (rule === undefined) { return [null, null]; }
    } else { return [null, null]; }
  } else if (PLURAL_RULES.indexOf(rule) === -1) {
    return [null, null];
  }
  return [rule, string.substring(leftBracketPos)];
}

function _consumePlural(string) {
  // {cnt, plural, one {foo} other {foos}}
  //                   ^^^^^
  let [bracketCount, escaping] = [0, false];
  let ptr = 0;
  while (ptr < string.length) {
    const char = string[ptr];
    if (char === "'") {
      const peek = string[ptr + 1];
      if (peek === "'") {
        ptr += 1;
      } else if (escaping) {
        escaping = false;
      } else if (peek === '{' || peek === '}') {
        escaping = true;
      }
    } else if (char === '{') {
      if (!escaping) {
        bracketCount += 1;
      }
    } else if (char === '}') {
      if (!escaping) {
        bracketCount -= 1;
      }
      if (bracketCount === 0) {
        return [string.substring(1, ptr), string.substring(ptr + 1).trim()];
      }
    }
    ptr += 1;
  }
  return [null, null];
}

/**
 * Determine if a string is an ICU pluralized string. Only works for the
 * simplest possible case, where the string starts and ends in '{' and '}'
 * respectively and the root ICU directive is a plural statement. ie This
 *
 *   {cnt, plural, one {ONE} other {OTHER}}
 *
 * will return 'true' while this
 *
 *   hello {cnt, plural, one {ONE} other {OTHER}}
 *
 * will return 'false'.
 *
 * @param {String} string
 * @returns {Boolean}
 */
export function isPluralized(string) {
  const [varName, rest] = _consumePreamble(string);
  let remaining = rest;
  if (varName == null) { return false; }

  const plurals = {};
  let rule;
  let plural;
  [rule, remaining] = _consumeRule(remaining);
  if (rule == null) { return false; }

  [plural, remaining] = _consumePlural(remaining.trim());
  if (plural == null) { return false; }
  plurals[rule] = plural;

  while (remaining.trim()) {
    // {cnt, plural, one {foo} other {foos}}
    //                         ^^^^^^^^^^^^
    [rule, remaining] = _consumeRule(remaining.trim());
    if (rule == null) { return false; }
    [plural, remaining] = _consumePlural(remaining.trim());
    if (plural == null) { return false; }
    plurals[rule] = plural;
  }

  if ((Object.keys(plurals).length === 1 && !('other' in plurals))
    || (!('one' in plurals && 'other' in plurals))
  ) {
    return false;
  }

  return true;
}
