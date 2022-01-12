import { useEffect, useState } from 'react';
import {
  onEvent,
  offEvent,
  LOCALE_CHANGED,
  TRANSLATIONS_FETCHED,
} from '@transifex/native';
import translateWithElements from '../utils/translateWithElements';

/* Return a reference of the 'translateWithElements' function. Also forces the
 * component to re-render in case the language changes.
 *
 * In most cases, we expect you to prefer using the `T` component over this,
 * but if you want to save the translation outcome in a variable for
 * postprocessing, you should use this.
 *
 * Usage
 *
 * function Capitalized({ _str, ...props }) {
 *   const t = useT();
 *   const translation = t(_str, props);
 *   return <span>{translation.toUpperCase()}</span>;
 * } */

export default function useT() {
  const [, setCounter] = useState(0);
  useEffect(() => {
    // Using `setCounter` will trigger a rerender
    function rerender() { setCounter((c) => c + 1); }
    onEvent(LOCALE_CHANGED, rerender);
    onEvent(TRANSLATIONS_FETCHED, rerender);
    return () => {
      offEvent(LOCALE_CHANGED, rerender);
      offEvent(TRANSLATIONS_FETCHED, rerender);
    };
  }, [setCounter]);
  return translateWithElements;
}
