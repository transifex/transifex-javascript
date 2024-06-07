import PropTypes from 'prop-types';

import useT from '../hooks/useT';

/* Main transifex-native component for react. It delegates the translation to
 * the `useT` hook, which will force the component to rerender in the event of
 * a language change.
 *
 * Usage:
 *
 * function App() {
 *   const [name, setName] = useState('Bill');
 *   return (
 *     <>
 *       <p><T _str="hello world" /></p>
 *       <p>
 *         <input value={name} onChange={(e) => setName(e.target.value)} />
 *         <T _str="hello {name}" name=name />
 *       </p>
 *     </>
 *   );
 * } */

export default function T({ _str, ...props }) {
  return useT()(_str, props);
}

T.propTypes = { _str: PropTypes.string.isRequired };
