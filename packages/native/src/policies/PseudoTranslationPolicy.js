/* eslint class-methods-use-this: 0, no-unused-vars: 0 */

const MAP = {
  a: 'ȧ',
  A: 'Ȧ',
  b: 'ƀ',
  B: 'Ɓ',
  c: 'ƈ',
  C: 'Ƈ',
  d: 'ḓ',
  D: 'Ḓ',
  e: 'ḗ',
  E: 'Ḗ',
  f: 'ƒ',
  F: 'Ƒ',
  g: 'ɠ',
  G: 'Ɠ',
  h: 'ħ',
  H: 'Ħ',
  i: 'ī',
  I: 'Ī',
  j: 'ĵ',
  J: 'Ĵ',
  k: 'ķ',
  K: 'Ķ',
  l: 'ŀ',
  L: 'Ŀ',
  m: 'ḿ',
  M: 'Ḿ',
  n: 'ƞ',
  N: 'Ƞ',
  o: 'ǿ',
  O: 'Ǿ',
  p: 'ƥ',
  P: 'Ƥ',
  q: 'ɋ',
  Q: 'Ɋ',
  r: 'ř',
  R: 'Ř',
  s: 'ş',
  S: 'Ş',
  t: 'ŧ',
  T: 'Ŧ',
  v: 'ṽ',
  V: 'Ṽ',
  u: 'ŭ',
  U: 'Ŭ',
  w: 'ẇ',
  W: 'Ẇ',
  x: 'ẋ',
  X: 'Ẋ',
  y: 'ẏ',
  Y: 'Ẏ',
  z: 'ẑ',
  Z: 'Ẑ',
};

/**
 * Missing policy for pseudo localization
 *
 * @export
 * @class PseudoTranslationPolicy
 */
export default class PseudoTranslationPolicy {
  handle(sourceString, localeCode) {
    return sourceString
      .split(/__txnative__/)
      .map((group) => {
        let pseudoString = '';
        for (let i = 0; i < group.length; i += 1) {
          const c = group.charAt(i);
          if (MAP[c]) {
            const cl = c.toLowerCase();
            if (cl === 'a' || cl === 'e' || cl === 'o' || cl === 'u') {
              pseudoString += MAP[c] + MAP[c];
            } else {
              pseudoString += MAP[c];
            }
          } else {
            pseudoString += c;
          }
        }
        return pseudoString;
      })
      .join('__txnative__');
  }
}
