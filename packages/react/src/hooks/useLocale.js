import { useContext, useEffect, useState } from 'react';
import {
  tx, onEvent, offEvent, LOCALE_CHANGED,
} from '@transifex/native';
import { TXNativeContext } from '../context/TXNativeContext';

/* Return a state variable with the currently selected locale, e.g. 'en'
 *
 * Combined with useLanguages hook you can create a language picker that
 * shows the selected language.
 *
 * Usage:
 *
 * function LanguagePicker() {
 *   const locale = useLocale();
 *
 *   return (
 *      ...
 *   );
 * }
 */
export default function useLocale(txInstance) {
  // Check for a different tx initialization
  const context = useContext(TXNativeContext);
  const instance = txInstance || context.instance || tx;

  const [locale, setLocale] = useState(instance.getCurrentLocale());

  useEffect(() => {
    function cb(_, caller) {
      if (caller === instance) {
        setLocale(instance.getCurrentLocale());
      }
    }

    onEvent(LOCALE_CHANGED, cb);
    return () => {
      offEvent(LOCALE_CHANGED, cb);
    };
  }, [instance]);

  return locale;
}
