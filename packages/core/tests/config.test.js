import {expect} from 'chai';
import Transifex from '../src/index';

const {
  configure,
  setConfig,
  getConfig,
  CDS_URL,
  PROJECT_TOKEN,
  SOURCE_LANG_CODE
} = Transifex;

describe('Config functions', () => {
  it('work', () => {
    configure({
      [CDS_URL]: 'a',
      [PROJECT_TOKEN]: 'b',
      [SOURCE_LANG_CODE]: 'c',
    });
    expect(getConfig(CDS_URL)).to.equal('a');
    expect(getConfig(PROJECT_TOKEN)).to.equal('b');
    expect(getConfig(SOURCE_LANG_CODE)).to.equal('c');

    setConfig(CDS_URL, 'a2')
    expect(getConfig(CDS_URL)).to.equal('a2');

    setConfig(PROJECT_TOKEN, 'b2')
    expect(getConfig(PROJECT_TOKEN)).to.equal('b2');

    setConfig(SOURCE_LANG_CODE, 'c2')
    expect(getConfig(SOURCE_LANG_CODE)).to.equal('c2');
  });
});
