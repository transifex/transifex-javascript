import React from 'react';
import PropTypes from 'prop-types';

import useLanguages from '../hooks/useLanguages';
import useLocale from '../hooks/useLocale';
import useWS from '../hooks/useWS';

/* Component to render a language picker. Language options will be fetched
  * asynchronously. Accepts props:
  *
  * - className: the CSS class to use on the <select> tag */

export default function LanguagePicker({ className = '' }) {
  const languages = useLanguages();
  const locale = useLocale();
  const ws = useWS();

  return (
    <select
      className={className}
      value={locale}
      onChange={(e) => ws.setCurrentLocale(e.target.value)}
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
