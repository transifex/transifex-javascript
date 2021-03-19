import { useEffect, useState } from 'react';
import {
  tx, onEvent, offEvent, LOCALE_CHANGED,
} from '@transifex/native';

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

export default function useLocale() {
  const [locale, setLocale] = useState(tx.getCurrentLocale());

  useEffect(() => {
    function cb() {
      setLocale(tx.getCurrentLocale());
    }

    onEvent(LOCALE_CHANGED, cb);
    return () => {
      offEvent(LOCALE_CHANGED, cb);
    };
  }, []);

  return locale;
}
