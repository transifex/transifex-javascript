import React, { useEffect, useState } from 'react';
import {
  t, onEvent, offEvent, LOCALE_CHANGED,
} from '@transifex/native';

/* Translate using `t` when some of the props are React elements. This enables
 * the interpolation of react elements in the translation.
 *
 * Example:
 *
 * function Message() {
 *   const CTA = <button onClick={ callback }><T _str="Click me" /></button>;
 *   return <T _str="To continue, please {cta}" cta={ CTA } />;
 * }
 *
 * How it works: The content of the `CTA` will be translated using the normal
 * `t` function. When the "To continue..." string is about to be translated, we
 * will replace the CTA value from the props with the
 * "__txnative__0__txnative__" string and we will keep the CTA element in an
 * array so that we can replace it later. The `t` function which will receive
 * the changed props will return
 * "tO CONTINUE, PLEASE __txnative__0__txnative__". At this point, we will use
 * a regular expression to iterate over the "translation" and replace all
 * `__txnative__XXX__txnative__` occurrences with the actual react elements
 * from the array we kept earlier. The result at this point will be an array
 * that looks like this: ["tO CONTINUE, PLEASE ", CTA]. We will then return a
 * new react element with this array wrapped in a <>{ result }</> JSX
 * statement. */
function translateWithComponents(_str, props) {
  const actualProps = {};
  const reactElements = [];
  Object.entries(props).forEach(([key, value]) => {
    if (React.isValidElement(value)) {
      actualProps[key] = `__txnative__${reactElements.length}__txnative__`;
      reactElements.push(value);
    } else {
      actualProps[key] = value;
    }
  });
  const translation = t(_str, actualProps);
  const result = [];
  let lastEnd = 0;
  [...translation.matchAll(/__txnative__(\d+)__txnative__/g)].forEach((match) => {
    const chunk = translation.slice(lastEnd, match.index);
    if (chunk) { result.push(chunk); }
    result.push(reactElements[parseInt(match[1], 10)]);
    lastEnd = match.index + match[0].length;
  });
  const chunk = translation.slice(lastEnd);
  if (chunk) { result.push(chunk); }

  if (result.length === 0) {
    return '';
  }
  if (result.length === 1) {
    return result[0];
  }
  return <>{result}</>;
}

/* Return a state variable with the translation of `_str` against props. In
 * case the language changes, the variable will be updated, causing the
 * component that uses it to be rerendered.
 *
 * In most cases, we expect you to prefer using the `T` component over this,
 * but if you want to save the translation outcome in a variable for
 * postprocessing, you should use this.
 *
 * Usage
 *
 * function Capitalized({ _str, ...props }) {
 *   const translation = useT(_str, props);
 *   return <span>{translation.toUpperCase()}</span>;
 * } */
export default function useT(_str, props) {
  const [translation, setTranslation] = useState('');
  useEffect(() => {
    function render() { setTranslation(translateWithComponents(_str, props)); }
    render();
    onEvent(LOCALE_CHANGED, render);
    return () => { offEvent(LOCALE_CHANGED, render); };
  }, [_str, props]);
  return translation;
}
