import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import useT from '../hooks/useT';
import { toStr, toElement } from '../utils/toStr';

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
 * }
 *
 * You can also include translatable content as the body of the T-tag. The body
 * must be a combination of text and React elements; you should **not** include
 * any javascript logic or it won't manage to be picked up by the CLI and
 * translated properly.
 *
 * function App() {
 *   const [name, setName] = useState('Bill');
 *   return (
 *     <>
 *       <p><T>hello world</T></p>
 *       <p><T>hello <b>world</b></T></p>
 *       <p>
 *         <input value={name} onChange={(e) => setName(e.target.value)} />
 *         <T name=name>hello {'{name}'}</T>
 *       </p>
 *     </>
 *   );
 * }
 *
 * */

export default function T({ _str, children, ...props }) {
  const t = useT();
  if (!children) { return t(_str, props); }

  const [templateArray, propsContainer] = toStr(children);
  const templateString = templateArray.join('');
  const translation = t(templateString, props);

  const result = toElement(translation, propsContainer);
  if (result.length === 0) { return ''; }
  if (result.length === 1) { return result[0]; }
  return <Fragment>{result}</Fragment>;
}

T.defaultProps = { _str: null, children: null };
T.propTypes = { _str: PropTypes.string, children: PropTypes.node };
