import t from './t';
import ut from './ut';
import { generateKey, escapeHtml } from './utils';
import { configure, setConfig, getConfig } from './config';
import {setLanguage, getLanguage, getAllLanguages } from './state';
import * as events from './events';

const Transifex = {
  // setup
  configure,
  setConfig,
  getConfig,

  // management
  setLanguage,
  getLanguage,
  getAllLanguages,

  // translation
  t,
  ut,

  // utils
  generateKey,
  escapeHtml,

  // events
  ...events,
}

export default Transifex;
