import {
  useEffect, useState, useContext, useCallback,
} from 'react';
import {
  tx,
  onEvent,
  offEvent,
  LOCALE_CHANGED,
  TRANSLATIONS_FETCHED,
} from '@transifex/native';
import translateWithElements from '../utils/translateWithElements';
import { TXNativeContext } from '../context/TXNativeContext';

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
  // Check for a different tx initialization
  const context = useContext(TXNativeContext);
  const instance = context.instance || tx;

  const [counter, setCounter] = useState(0);
  useEffect(() => {
    // Using `setCounter` will trigger a rerender
    function rerender(_, caller) {
      if (instance === caller) {
        setCounter((c) => c + 1);
      }
    }
    onEvent(LOCALE_CHANGED, rerender);
    onEvent(TRANSLATIONS_FETCHED, rerender);
    return () => {
      offEvent(LOCALE_CHANGED, rerender);
      offEvent(TRANSLATIONS_FETCHED, rerender);
    };
  }, [setCounter, instance]);

  return useCallback(
    (_str, props) => translateWithElements(_str, props, context),
    [context, counter],
  );
}
