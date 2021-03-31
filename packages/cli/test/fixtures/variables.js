const { t } = require('@transifex/native');

function log() {}

const outer = 'Outer Text';
const long = 
    ' Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text'
  + ' Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text'
  + ' Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text';
const merged = outer + long;
const complicated = ('a' + 'b') + ('c' + ('d' + 'e') + 'f') + 'g';

function foo() {
  const inner = 'Inner Text';

  // valid
  log(t('a' + 'b' + 'c'));
  log(t(outer));
  log(t(long));
  log(t(merged));
  log(t(complicated));
  log(t(inner));

  const empty;
  let nonConst = 'should not be visible';
  const constMadeOfNonConsts = 'again, it ' + nonConst;
  const constMadeOfTemplateLiterals = `this one is ` + nonConst;

  // invalid
  log(t(empty));
  log(t(nonConst));
  log(t(constMadeOfNonConsts));
  log(t(constMadeOfTemplateLiterals));
}

module.exports = foo;

