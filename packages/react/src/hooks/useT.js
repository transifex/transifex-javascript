import { useEffect, useState } from 'react';
import {
  t, onEvent, offEvent, LOCALE_CHANGED,
} from '@transifex/native';

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
    function render() { setTranslation(t(_str, props)); }
    render();
    onEvent(LOCALE_CHANGED, render);
    return () => { offEvent(LOCALE_CHANGED, render); };
  }, [_str, props]);
  return translation;
}
