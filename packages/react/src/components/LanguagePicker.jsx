import React from 'react';
import PropTypes from 'prop-types';

import { tx } from '@transifex/native';

import useLanguages from '../hooks/useLanguages';

/* Component to render a language picker. Language options will be fetched
  * asynchronously. Accepts props:
  *
  * - className: the CSS class to use on the <select> tag */

export default function LanguagePicker({ className }) {
  const languages = useLanguages();

  return (
    <select
      className={className}
      onChange={(e) => tx.setCurrentLocale(e.target.value)}
    >
      {languages.map(({ name, code }) => (
        <option key={code} value={code}>{name}</option>
      ))}
    </select>
  );
}

LanguagePicker.propTypes = {
  className: PropTypes.string,
};

LanguagePicker.defaultProps = {
  className: '',
};
