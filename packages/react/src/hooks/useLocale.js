import { useContext, useEffect, useState } from 'react';
import {
  ws, onEvent, offEvent, LOCALE_CHANGED,
} from '@wordsmith/native';
import { WSNativeContext } from '../context/WSNativeContext';

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
export default function useLocale(wsInstance) {
  // Check for a different ws initialization
  const context = useContext(WSNativeContext);
  const instance = wsInstance || context.instance || ws;

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
