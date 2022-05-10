const PLURAL_RULES = ['zero', 'one', 'two', 'few', 'many', 'other'];

// The `_consumeFOO` functions take an input, "consume" a part of it to
// produce the first return value and return the "unconsumed" part of the input
// as the second return value

// '{cnt, plural, one {ONE} other {OTHER}}' =>
//     ['cnt', 'one {ONE} other {OTHER}']
function consumePreamble(string) {
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

  // Make sure `varName` is a proper variable and that `keyword` is 'plural'
  if (!/^[\w_]+$/.test(varName) || keyword !== 'plural') {
    return [null, null];
  }

  return [
    varName,
    string.substring(secondCommaPos + 1, string.length - 1).trim()];
}

// 'one {ONE} other {OTHER}' => ['one', '{ONE} other {OTHER}']
// 'other {OTHER}' => ['other', '{OTHER}']
function consumeRule(string) {
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

// '{ONE} other {OTHER}' => ['ONE', 'other {OTHER}']
// '{OTHER}' => ['OTHER', '']
function consumePlural(string) {
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

/* Make an effort to split (explode) an ICU message format string into
  * plurals. Works on only the simplest case, when a gettext-like statement
  * like:
  *
  *   ngettext("You have %d new message", "You have %d new messages", cnt)
  *
  * was converted into an ICU message like:
  *
  *   {cnt, plural,
  *     one {You have # new message}
  *     other {You have # new messages}}
  *
  * The return value is a size-2 array with the name of the variable used and
  * an object mapping the plural rule to the plural version, eg:
  *
  *   ['cnt',
  *    {one: 'You have # new message',
  *     other: 'You have # new messages'}]
  *
  * If the string can't be converted for any reason, `null` will be used in
  * place of the variable name and only rule=5 (other) will be returned.
  *
  * @function
  * @param {String} string
  * @returns {[String, {rule: String}]} variable name and plural forms pair
  *
  * */
export function explodePlurals(string) {
  const defaultResult = [null, { other: string }];

  // {cnt, plural, one {foo} other {foos}}
  // ^^^^^^^^^^^^
  // eslint-disable-next-line prefer-const
  let [varName, remaining] = consumePreamble(string);
  if (varName == null) { return defaultResult; }

  // {cnt, plural, one {foo} other {foos}}
  //               ^^^^^^^^^
  const plurals = {};
  let rule;
  let plural;
  [rule, remaining] = consumeRule(remaining);
  if (rule == null) { return defaultResult; }

  [plural, remaining] = consumePlural(remaining.trim());
  if (plural == null) { return defaultResult; }
  plurals[rule] = plural;

  while (remaining.trim()) {
    // {cnt, plural, one {foo} other {foos}}
    //                         ^^^^^^^^^^^^
    [rule, remaining] = consumeRule(remaining.trim());
    if (rule == null) { return defaultResult; }
    [plural, remaining] = consumePlural(remaining.trim());
    if (plural == null) { return defaultResult; }
    plurals[rule] = plural;
  }

  if ((Object.keys(plurals).length === 1 && !('other' in plurals))
    || (!('one' in plurals && 'other' in plurals))
  ) {
    return defaultResult;
  }

  return [varName, plurals];
}

/* Convert a plurals object into an ICU plural statement, eg:
  *
  * {one: "ONE", other: "OTHER"} => '{???, plural, one {ONE} other {OTHER}}'
  *
  * @function
  * @param {Object} plurals
  * @param {string} [count='???']
  * @returns {String}
 */
export function implodePlurals(plurals, count = '???') {
  const result = [`{${count}, plural,`];
  // Lets get the rules in order
  // eslint-disable-next-line no-restricted-syntax
  for (const rule of PLURAL_RULES) {
    if (rule in plurals) {
      const plural = plurals[rule];
      result.push(` ${rule} {${plural}}`);
    }
  }
  result.push('}');
  return result.join('');
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
  const plurals = explodePlurals(string)[1];
  return Object.keys(plurals).length > 1;
}
