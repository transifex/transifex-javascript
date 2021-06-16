import { T, UT, useT } from '@transifex/react';

function foo() {
  let msg = useT('uses useT');

  const str2 = 'uses useT as const';
  let msg2 = useT(str2);

  const str3 = 'uses _str as const';
  return (
    <div>
      <T
        _str="Text 1"
        _context="foo"
        _tags="tag1,tag2"
        _charlimit="10"
        _comment="comment" />

      <T _str="Text 2" />
      <T _str="Text 3" />
      <T _str="Text 4" />
      <T _str="A {button} and a {bold} walk into a bar"
          button={<button><T _str="button" /></button>}
          bold={<b><T _str="bold" /></b>} />
      <UT _str="<b>HTML text</b>" _tags="tag1" />
      <UT _str="<b>HTML inline text</b>" _inline />
      <T _str={str3} />
      {msg}
      {msg2}
    </div>
  );
}
