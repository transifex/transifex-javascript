/**
 * Check if object is a function
 *
 * @export
 * @param {*} obj
 * @return {Boolean}
 */
export function isFunction(obj) {
  return typeof obj === 'function';
}

/**
 * Check if object is string
 *
 * @export
 * @param {*} obj
 * @return {Boolean}
 */
export function isString(obj) {
  return typeof obj === 'string';
}

/**
 * Merge array2 into array1
 *
 * @export
 * @param {Array} array1
 * @param {Array} array2
 * @return {Array} array1
 */
export function mergeArrays(array1, array2) {
  let i = array2.length;
  let a;
  while (i--) {
    a = array2[i];
    if (array1.indexOf(a) < 0) {
      array1.push(a);
    }
  }
  return array1;
}

/**
 * Remove element from array, returns true on success
 *
 * @export
 * @param {Array} list
 * @param {*} value
 * @return {Boolean}
 */
export function removeFromArray(list, value) {
  const index = list.indexOf(value);
  if (index !== -1) {
    list.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Encode string
 *
 * @export
 * @param {String} str
 * @return {String}
 */
export function encodeString(str) {
  return str.replace(/\u00a0/g, '&nbsp;');
}

/**
 * Decode string
 *
 * @export
 * @param {String} str
 * @return {String}
 */
export function decodeString(str) {
  return str.replace(/&nbsp;/g, '\u00a0');
}

/**
 * Strip multiple spaces, new lines and tabs
 *
 * @export
 * @param {String} str
 * @return {String}
 */
export function stripWhitespace(str) {
  if (!str || !str.trim().length) return null;
  return encodeString(str).replace(/\s+/g, ' ').trim();
}

/**
 * Remove comments from HTML code
 *
 * @export
 * @param {String} str
 * @return {String}
 */
export function removeComments(str) {
  return (str || '').replace(/<!--([\s\S]*?)-->/g, '');
}
