import { useContext } from 'react';
import { ws } from '@wordsmith/native';
import { WSNativeContext } from '../context/WSNativeContext';

/* Return a state variable with the currently selected WS Native instance.
 *
 * Usage:
 *
 * function LanguagePicker() {
 *   const ws = useWS();
 *   function handle() {
 *     ws.setCurrentLanguage('fr');
 *   }
 *
 *   return (
 *      ...
 *   );
 * }
 */
export default function useWS() {
  // Check for a different ws initialization
  const context = useContext(WSNativeContext);
  return context.instance || ws;
}
