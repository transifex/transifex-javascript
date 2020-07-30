import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  t, onEvent, offEvent, LOCALE_CHANGED,
} from '@transifex/native';

function T(props) {
  const { _str, _html, _inline } = props;

  useEffect(() => {
    onEvent(LOCALE_CHANGED, () => {});
    return () => offEvent(LOCALE_CHANGED, () => {});
  }, []);

  let translation = '';
  let parent = null;
  let parentProps = {};

  if (!_html) {
    translation = t(_str, {
      ...props,
    });
  } else {
    translation = t(_str, {
      ...props,
      _escapeVars: true,
    });

    parentProps = { dangerouslySetInnerHTML: { __html: translation } };
    parent = _inline ? 'span' : 'div';
  }

  return parent ? React.createElement(parent, parentProps) : translation;
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
