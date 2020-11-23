import { useEffect, useState } from 'react';
import { onEvent, offEvent, LOCALE_CHANGED } from '@transifex/native';
import translateWithElements from '../utils/translateWithElements';

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
  const [, setCounter] = useState(0);
  useEffect(() => {
    // Using `setCounter` will trigger a rerender
    function rerender() { setCounter((c) => c + 1); }
    onEvent(LOCALE_CHANGED, rerender);
    return () => { offEvent(LOCALE_CHANGED, rerender); };
  }, [setCounter]);
  return translateWithElements(_str, props);
}
