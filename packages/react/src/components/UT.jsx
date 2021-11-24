import PropTypes from 'prop-types';
import React from 'react';

import useT from '../hooks/useT';

/* Variant on the `T` component which allows raw HTML to be entered in place of
 * the _str property which will be rendered as-is.
 *
 * Usage:
 *
 * function App() {
 *   return (
 *     <UT str="<em>hello</em> <strong>world</strong>" />
 *   )
 * }
 *
 * The `_inline` property will determine if the result will be wrapped in a
 * `div` or a `span`.
 * */

export default function UT({ _str, _inline, ...props }) {
  const translation = useT()(
    _str,
    { _inline, _escapeVars: true, ...props },
  );
  const parentProps = { dangerouslySetInnerHTML: { __html: translation } };
  const parent = _inline ? 'span' : 'div';
  return React.createElement(parent, parentProps);
}

UT.defaultProps = {
  _inline: false,
};

UT.propTypes = {
  _str: PropTypes.string.isRequired,
  _inline: PropTypes.bool,
};
