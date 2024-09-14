import { useState, useEffect, useContext } from 'react';
import { ws } from '@wordsmith/native';
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
 *     <select onChange={ (e) => ws.setCurrentLocale(e.target.value) }>
 *       { languages.map(({code, name}) => (
 *         <option key={ code } value={ code }>{ name }</option>
 *       )) }
 *     </select>
 *   );
 * } */

export default function useLanguages(wsInstance) {
  // Check for a different ws initialization
  const context = useContext(TXNativeContext);
  const instance = wsInstance || context.instance || ws;

  const [languages, setLanguages] = useState([]);
  useEffect(() => {
    async function fetch() {
      setLanguages(await instance.getLanguages());
    }
    fetch();
  }, [instance]);
  return languages;
}
