import { expect } from 'chai';
import {
  init,
  setConfig,
  getConfig,
  CDS_URL,
  PROJECT_TOKEN,
  SOURCE_LANG_CODE,
  MISSING_POLICY,
  MISSING_POLICY_SOURCE
} from '../src/index';

describe('Config functions', () => {
  it('work', () => {
    init({
      [CDS_URL]: 'a',
      [PROJECT_TOKEN]: 'b',
      [SOURCE_LANG_CODE]: 'c',
      [MISSING_POLICY]: MISSING_POLICY_SOURCE,
    });
    expect(getConfig(CDS_URL)).to.equal('a');
    expect(getConfig(PROJECT_TOKEN)).to.equal('b');
    expect(getConfig(SOURCE_LANG_CODE)).to.equal('c');
    expect(getConfig(MISSING_POLICY)).to.equal(MISSING_POLICY_SOURCE);

    setConfig(CDS_URL, 'a2')
    expect(getConfig(CDS_URL)).to.equal('a2');

    setConfig(PROJECT_TOKEN, 'b2')
    expect(getConfig(PROJECT_TOKEN)).to.equal('b2');

    setConfig(SOURCE_LANG_CODE, 'c2')
    expect(getConfig(SOURCE_LANG_CODE)).to.equal('c2');
  });
});
