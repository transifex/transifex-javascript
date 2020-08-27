import React from 'react';
import PropTypes from 'prop-types';

import { tx } from '@transifex/native';

import useLanguages from '../hooks/useLanguages';

/* Component to render a language picker. Language options will be fetched
  * asynchronously. Accepts props:
  *
  * - sourceLanguage: an object with 'code' and 'name' fields, defaults to
  *   `{code: 'en', name: 'English'}`
  *
  * - className: the CSS class to use on the <select> tag */
export default function LanguagePicker({ sourceLanguage, className }) {
  const languages = useLanguages();

  return (
    <select
      className={className}
      onChange={(e) => tx.setCurrentLocale(e.target.value)}
    >
      <option value={sourceLanguage.code}>{sourceLanguage.name}</option>
      {languages.map(({ name, code }) => (
        <option key={code} value={code}>{name}</option>
      ))}
    </select>
  );
}

LanguagePicker.propTypes = {
  sourceLanguage: (
    PropTypes
      .shape({ name: PropTypes.string, code: PropTypes.string })
  ),
  className: PropTypes.string,
};

LanguagePicker.defaultProps = {
  sourceLanguage: { code: 'en', name: 'English' },
  className: '',
};
