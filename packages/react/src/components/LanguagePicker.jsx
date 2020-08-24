import React from 'react';
import { tx } from '@transifex/native';
import useLanguages from '../hooks/useLanguages';

function defaultOuter({ children, onChange }) {
  return (
    <select onChange={(e) => { onChange(e.target.value); }}>
      {children}
    </select>
  );
}

function defaultInner({ language, key }) {
  return (
    <option key={key} value={language.code}>
      {language.name}
    </option>
  );
}

/* Language picker. Will soon populate with available languages. By default
  * renders a <select> dropdown which changes the selected language upon
  * changing. You can override it's result by supplying the 'outer' and 'inner'
  * props
  *
  * - sourceLanguage: an object with 'code' and 'name' which describes the
  *   source language
  *
  * - outer: a function that accepts 'children' and 'onChange' and renders the
  *   outer element for the language picker. 'children' must be put where each
  *   individual language option will be presented. If the outer element can
  *   capture an event which should change the language (for example <select>'s
  *   'onChange') it should call 'onChange' with the language code as the
  *   argument
  *
  * - inner: a function that accepts 'language', 'onChange' and 'key' and
  *   renders each individual language. 'language' is an object with 'code',
  *   'name', etc that describes the current language. If the inner elements
  *   can capture an event which should change the language (for example
  *   <button>'s 'onClick'), they should call 'onChange' with the language code
  *   as the argument. 'key' is an incrementing number and should be included
  *   as a prop to each language element to keep react from complaining.
  *
  * Usage:
  *
  * Note: the first example (dropdown) is the default language picker.
  *
  * function AppWithDropdown() {
  *   const outer = ({children, onChange}) => (
  *     <select onChange={(e) => { onChange(e.target.value); }}>
  *       {children}
  *     </select>
  *   );
  *   const inner = ({language, key}) => (
  *     <option key={key} value={language.code}>
  *       {language.name}
  *     </option>
  *   );
  *   return (
  *     <div>
  *       <p><T _str="Hello world" /></p>
  *       <LanguagePicker
  *         sourceLanguage={{name: 'English', code: 'en'}}
  *         outer={outer}
  *         inner={inner} />
  *     </div>
  *   );
  * }
  *
  * function AppWithButtons() {
  *   const outer = ({children}) => <div>{children}</div>;
  *   const inner = ({language, onChange, key}) => (
  *     <button key={key} onClick={() => { onChange(language.code); }}>
  *       {language.name}
  *     </button>
  *   );
  *   return (
  *     <div>
  *       <p><T _str="Hello world" /></p>
  *       <LanguagePicker
  *         sourceLanguage={{name: 'English', code: 'en'}}
  *         outer={outer}
  *         inner={inner} />
  *     </div>
  *   );
  * }
  *
  * */
export default function LanguagePicker({ sourceLanguage, outer, inner }) {
  const languages = useLanguages();

  const actualOuter = outer || defaultOuter;
  const actualInner = inner || defaultInner;

  const onChange = tx.setCurrentLocale.bind(tx);

  const children = [];
  if (sourceLanguage) {
    children.push(actualInner({ language: sourceLanguage, onChange, key: 0 }));
  }
  for (let i = 0; i < languages.length; i += 1) {
    const language = languages[i];
    children.push(actualInner({ language, onChange, key: i + 1 }));
  }

  return actualOuter({ children, onChange });
}
