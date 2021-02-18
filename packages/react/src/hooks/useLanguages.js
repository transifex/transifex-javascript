import { useState, useEffect } from 'react';
import { tx } from '@transifex/native';

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

export default function useLanguages() {
  const [languages, setLanguages] = useState([]);
  useEffect(() => {
    async function fetch() {
      setLanguages(await tx.getLanguages());
    }
    fetch();
  }, []);
  return languages;
}
