import {
  useEffect, useState, useContext, useCallback,
} from 'react';
import {
  ws,
  onEvent,
  offEvent,
  LOCALE_CHANGED,
  TRANSLATIONS_FETCHED,
} from '@wordsmith/native';
import translateWithElements from '../utils/translateWithElements';
import { WSNativeContext } from '../context/WSNativeContext';

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

export default function useT(wsInstance) {
  // Check for a different ws initialization
  const context = useContext(WSNativeContext);
  const instance = wsInstance || context.instance || ws;

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
    (_str, props) => translateWithElements(_str, props, instance),
    [instance, counter],
  );
}
