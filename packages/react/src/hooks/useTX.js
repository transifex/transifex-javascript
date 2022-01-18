import { useContext } from 'react';
import { tx } from '@transifex/native';
import { TXNativeContext } from '../context/TXNativeContext';

/* Return a state variable with the currently selected TX Native instance.
 *
 * Usage:
 *
 * function LanguagePicker() {
 *   const tx = useTX();
 *   function handle() {
 *     tx.setCurrentLanguage('fr');
 *   }
 *
 *   return (
 *      ...
 *   );
 * }
 */
export default function useTX() {
  // Check for a different tx initialization
  const context = useContext(TXNativeContext);
  return context.instance || tx;
}
