import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  t, onEvent, offEvent, LOCALE_CHANGED,
} from '@transifex/native';

function T({ _str, _html, _inline }) {
  const [translation, setTranslation] = useState('');

  useEffect(() => {
    function render() {
      if (!_html) {
        setTranslation(t(_str, { _html, _inline }));
      } else {
        const result = t(_str, {
          _html,
          _inline,
          _escapeVars: true,
        });
        const parentProps = { dangerouslySetInnerHTML: { __html: result } };
        const parent = _inline ? 'span' : 'div';
        setTranslation(React.createElement(parent, parentProps));
      }
    }
    render();
    onEvent(LOCALE_CHANGED, render);
    return () => { offEvent(LOCALE_CHANGED, render); };
  }, [_str, _html, _inline]);

  return translation;
}

T.defaultProps = {
  _html: false,
  _inline: false,
};

T.propTypes = {
  _str: PropTypes.string.isRequired,
  _html: PropTypes.bool,
  _inline: PropTypes.bool,
};

export default T;
