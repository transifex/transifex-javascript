import { useState, useEffect, useContext } from 'react';
import { tx } from '@transifex/native';
import { TXNativeContext } from '../context/TXNativeContext';

/* Return a state variable that will soon be populated with the available
 * languages
 *
 * Usage:
 *
 * function LanguagePicker() {
 *   const languages = useLanguages();
 *
 *   return (
 *     <select onChange={ (e) => tx.setCurrentLocale(e.target.value) }>
 *       { languages.map(({code, name}) => (
 *         <option key={ code } value={ code }>{ name }</option>
 *       )) }
 *     </select>
 *   );
 * } */

export default function useLanguages(txInstance) {
  // Check for a different tx initialization
  const context = useContext(TXNativeContext);
  const instance = txInstance || context.instance || tx;

  const [languages, setLanguages] = useState([]);
  useEffect(() => {
    async function fetch() {
      setLanguages(await instance.getLanguages());
    }
    fetch();
  }, [instance]);
  return languages;
}
