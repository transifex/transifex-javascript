export const CDS_URL = 'CDS_URL';
export const PROJECT_TOKEN = 'PROJECT_TOKEN';
export const SOURCE_LANG_CODE = 'SOURCE_LANG_CODE';
export const MISSING_POLICY = 'MISSING_POLICY';

// Missing policy
export const MISSING_POLICY_SOURCE = 0;
export const MISSING_POLICY_PSEUDO = 1;

const CONFIG = {
  [CDS_URL]: 'https://cds.svc.transifex.net',
  [PROJECT_TOKEN]: '',
  [SOURCE_LANG_CODE]: '',
  [MISSING_POLICY]: MISSING_POLICY_SOURCE,
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
 *   MISSING_POLICY: <Enum>
 * }
 */
export function init(options={}) {
  CONFIG[CDS_URL] = options[CDS_URL] || CONFIG[CDS_URL];
  CONFIG[PROJECT_TOKEN] = options[PROJECT_TOKEN] || CONFIG[PROJECT_TOKEN];
  CONFIG[SOURCE_LANG_CODE] = options[SOURCE_LANG_CODE] || CONFIG[SOURCE_LANG_CODE];
  CONFIG[MISSING_POLICY] = options[MISSING_POLICY] || CONFIG[MISSING_POLICY];
}

/**
 * Set configuration property
 *
 * @export
 * @param {String} property [CDS_URL | PROJECT_TOKEN | SOURCE_LANG_CODE | MISSING_POLICY]
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
 * @param {String} property [CDS_URL | PROJECT_TOKEN | SOURCE_LANG_CODE | MISSING_POLICY]
 * @returns
 */
export function getConfig(property) {
  return CONFIG[property]
}
