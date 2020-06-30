export const CDS_URL = 'CDS_URL';
export const PROJECT_TOKEN = 'PROJECT_TOKEN';
export const SOURCE_LANG_CODE = 'SOURCE_LANG_CODE';

const CONFIG = {
  CDS_URL: 'https://cds.svc.transifex.net',
  PROJECT_TOKEN: '',
  SOURCE_LANG_CODE: 'en',
}

/**
 * Initialize native
 * Must be called before everything else
 *
 * @export
 * @param {Object} options
 * {
 *   CDS_URL: <String> (optional)
 *   PROJECT_TOKEN: <String>
 *   SOURCE_LANG_CODE: <String>
 * }
 */
export function configure(options={}) {
  CONFIG.CDS_URL = options.CDS_URL || CONFIG.CDS_URL;
  CONFIG.PROJECT_TOKEN = options.PROJECT_TOKEN || CONFIG.PROJECT_TOKEN;
  CONFIG.SOURCE_LANG_CODE = options.SOURCE_LANG_CODE || CONFIG.SOURCE_LANG_CODE;
}

/**
 * Set configuration property
 *
 * @export
 * @param {String} property [CDS_URL | PROJECT_TOKEN | SOURCE_LANG_CODE]
 * @param {*} value
 * @returns
 */
export function setConfig(property, value) {
  CONFIG[property] = value;
}

/**
 * Get configuration property
 *
 * @export
 * @param {String} property [CDS_URL | PROJECT_TOKEN | SOURCE_LANG_CODE]
 * @returns
 */
export function getConfig(property) {
  return CONFIG[property]
}
