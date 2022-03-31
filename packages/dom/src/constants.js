/* eslint-disable no-bitwise */
export const SKIP_TAGS = {
  SCRIPT: true,
  STYLE: true,
  LINK: true,
  IFRAME: true,
  NOSCRIPT: true,
  CANVAS: true,
  AUDIO: true,
  VIDEO: true,
  CODE: true,
  TIME: true,
  VAR: true,
  KBD: true,
};

export const SKIP_CLASS = {
  notranslate: true,
  facebook_container: true,
  twitter_container: true,
};

export const SKIP_TAGS_CONTENT = {
  TEXTAREA: true,
};

export const BLOCK_NODES = {
  ADDRESS: true,
  FIGCAPTION: true,
  OL: true,
  ARTICLE: true,
  FIGURE: true,
  OUTPUT: true,
  ASIDE: true,
  FOOTER: true,
  P: true,
  FORM: true,
  PRE: true,
  BLOCKQUOTE: true,
  H1: true,
  H2: true,
  H3: true,
  H4: true,
  H5: true,
  H6: true,
  AUDIO: true,
  CANVAS: true,
  SECTION: true,
  HEADER: true,
  TABLE: true,
  DD: true,
  HGROUP: true,
  TFOOT: true,
  DIV: true,
  HR: true,
  UL: true,
  DL: true,
  VIDEO: true,
  FIELDSET: true,
  NOSCRIPT: true,
  SCRIPT: true,
  IFRAME: true,
  TEXTAREA: true,
};

// parser parameters
export const PARSER_OPTIONS = {
  // options
  DEFAULT: 1 << 2, // enable urls as variables by default
  DO_NOT_COLLECT: 1 << 1,
  URLS_AS_VARS: 1 << 2,
  // helper functions
  set: (value, option) => value | option,
  unset: (value, option) => value & (~option),
  isset: (value, option) => value & option,
  isunset: (value, option) => !(value & option),
};

export const IS_NOT_TEXTUAL_REGEX = /^(&nbsp;|\s|\d|[-\/:-?~@#!"^_`\.,\[\]])*$/; // eslint-disable-line
