import { useContext } from 'react';
import { ws } from '@wordsmith/native';
import { TXNativeContext } from '../context/TXNativeContext';

/* Return a state variable with the currently selected TX Native instance.
 *
 * Usage:
 *
 * function LanguagePicker() {
 *   const ws = useTX();
 *   function handle() {
 *     ws.setCurrentLanguage('fr');
 *   }
 *
 *   return (
 *      ...
 *   );
 * }
 */
export default function useTX() {
  // Check for a different ws initialization
  const context = useContext(TXNativeContext);
  return context.instance || ws;
}
