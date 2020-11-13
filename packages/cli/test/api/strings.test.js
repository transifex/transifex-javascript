/* globals describe, it */

const { expect } = require('chai');
const { generateKey } = require('@transifex/native');
const { SourceString, SourceStringSet } = require('../../src/api/strings');

describe('SourceString', () => {
  it('simple case', () => {
    const string = new SourceString({ sourceString: 'hello world' });
    expect(string.sourceString).to.equal('hello world');
    expect(string.context).to.deep.equal([]);
    expect(string.characterLimit).to.equal(undefined);
    expect(string.developerComment).to.equal(undefined);
    expect(string.occurrences).to.deep.equal([]);
    expect(string.tags).to.deep.equal([]);
  });
  it('all arguments', () => {
    const string = new SourceString({
      sourceString: 'hello world',
      context: ['context'],
      characterLimit: 10,
      developerComment: 'comment',
      occurrences: ['occurrence'],
      tags: ['tag'],
    });
    expect(string.sourceString).to.equal('hello world');
    expect(string.context).to.deep.equal(['context']);
    expect(string.characterLimit).to.equal(10);
    expect(string.developerComment).to.equal('comment');
    expect(string.occurrences).to.deep.equal(['occurrence']);
    expect(string.tags).to.deep.equal(['tag']);
  });
  it('array-like arguments are converted to arrays', () => {
    const string = new SourceString({
      sourceString: 'hello world',
      context: 'a,b',
      occurrences: 'a,b',
      tags: 'a,b',
    });
    expect(string.sourceString).to.equal('hello world');
    expect(string.context).to.deep.equal(['a', 'b']);
    expect(string.occurrences).to.deep.equal(['a', 'b']);
    expect(string.tags).to.deep.equal(['a', 'b']);
  });
  it('characterLimit is converted to int', () => {
    const string = new SourceString({
      sourceString: 'hello world',
      characterLimit: '10',
    });
    expect(string.sourceString).to.equal('hello world');
    expect(string.characterLimit).to.equal(10);
  });
  it('generates key', () => {
    const string1 = new SourceString({ sourceString: 'hello world' });
    expect(string1.key).to.equal(generateKey('hello world'));

    const string2 = new SourceString({
      sourceString: 'hello world',
      context: ['context'],
    });
    expect(string2.key).to.equal(generateKey(
      'hello world', { _context: 'context' },
    ));
  });
});

describe('SourceStringSet', () => {
  it('simple case', () => {
    const string = new SourceString({ sourceString: 'hello world' });
    const stringSet = new SourceStringSet([string]);

    /* eslint-disable no-unused-expressions */
    expect(stringSet.get(string.key)).to.exist;
    expect(stringSet.get('random key')).to.not.exist;
    /* eslint-enable no-unused-expressions */
    expect(stringSet.keys()).to.deep.equal([string.key]);
    expect(stringSet.values()).to.deep.equal([string]);
    expect(stringSet.entries()).to.deep.equal([[string.key, string]]);
    expect(stringSet.length).to.equal(1);
  });
  it('merges strings with the same key', () => {
    const string1 = new SourceString({
      sourceString: 'hello world',
      context: ['context'],
      characterLimit: 100,
      developerComment: 'coment1',
      occurrences: ['occurrence1'],
      tags: ['tag1'],
    });
    const string2 = new SourceString({
      sourceString: 'hello world',
      context: ['context'],
      characterLimit: 2,
      developerComment: 'coment2',
      occurrences: ['occurrence2'],
      tags: ['tag2'],
    });
    expect(string1.key).to.equal(string2.key);
    const stringSet = new SourceStringSet();
    stringSet.add(string1);
    stringSet.add(string2);
    expect(stringSet.length).to.equal(1);
    expect(stringSet.get(string1.key)).to.deep.equal(new SourceString({
      sourceString: 'hello world',
      context: ['context'],
      characterLimit: 2, // The smalest characterLimit has priority
      developerComment: 'coment1', // The first comment has priority
      occurrences: ['occurrence1', 'occurrence2'],
      tags: ['tag1', 'tag2'],
    }));
  });
});
