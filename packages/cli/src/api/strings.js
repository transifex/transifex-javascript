const _ = require('lodash');
const { generateKey } = require('@transifex/native');

// If string, convert to array
function splitString(value) {
  let result = value;
  if (_.isString(value)) {
    result = _.split(value, ',');
    result = _.map(result, (part) => part.trim());
  }
  return result || [];
}

/* Container for extracted source strings. Generally simply stores the
  * 'sourceString', 'context', 'characterLimit', 'developerComment',
  * 'occurrences' and 'tags' attributes. Applies special getters and setters
  * for 'context', 'occurrences' and 'tags' so that regardless of whether a
  * comma-separated string or an array of strings is provided, the returned
  * value will always be an array of strings. Also implements the 'key'
  * property */
class SourceString {
  constructor({
    sourceString, context, characterLimit, developerComment, occurrences, tags,
  } = {}) {
    this.sourceString = sourceString;
    this.context = context;
    this.characterLimit = characterLimit;
    this.developerComment = developerComment;
    this.occurrences = occurrences;
    this.tags = tags;
  }

  clone() {
    return new SourceString({
      sourceString: this.sourceString,
      context: this.context,
      characterLimit: this.characterLimit,
      developerComment: this.developerComment,
      occurrences: this.occurrences,
      tags: this.tags,
    });
  }

  get key() {
    return generateKey(
      this.sourceString,
      { _context: this.context.join(':') },
    );
  }

  set context(value) { this._context = splitString(value); }

  get context() { return this._context; }

  set characterLimit(value) {
    this._characterLimit = parseInt(value, 10);
    if (_.isNaN(this._characterLimit)) { this._characterLimit = undefined; }
  }

  get characterLimit() { return this._characterLimit; }

  set occurrences(value) { this._occurrences = splitString(value); }

  get occurrences() { return this._occurrences; }

  set tags(value) { this._tags = splitString(value); }

  get tags() { return this._tags; }
}

function _merge(left, right) {
  const result = left.clone();

  if (left.characterLimit && right.characterLimit) {
    result.characterLimit = _.min([left.characterLimit, right.characterLimit]);
  } else {
    result.characterLimit = left.characterLimit || right.characterLimit;
  }

  if (!left.developerComment && right.developerComment) {
    result.developerComment = right.developerComment;
  }

  result.occurrences = _.sortBy(_.uniq(_.concat(
    left.occurrences, right.occurrences,
  )));

  result.tags = _.sortBy(_.uniq(_.concat(left.tags, right.tags)));

  return result;
}

/* Container for a collection of extracted source strings. If you attempt to
  * add a string whose key matches on of the preexisting source strings, they
  * will be merged */
class SourceStringSet {
  constructor(strings) {
    this._data = {};
    this.update(strings);
  }

  add(string) {
    if (string.key in this._data) {
      this._data[string.key] = _merge(this._data[string.key], string);
    } else {
      this._data[string.key] = string;
    }
  }

  get(key) { return this._data[key]; }

  update(strings) { _.forEach(strings, (string) => { this.add(string); }); }

  keys() { return Object.keys(this._data); }

  values() { return Object.values(this._data); }

  entries() { return Object.entries(this._data); }

  get length() { return Object.keys(this._data).length; }
}

module.exports = { SourceString, SourceStringSet };
