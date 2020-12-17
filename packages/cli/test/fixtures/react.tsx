import * as React from 'react';
import { T, UT } from '@transifex/react';

class TestProps {
  public name:string;
}

class Test extends React.Component<TestProps, any> {
  private foo:number;
  constructor(props:TestProps) {
    super(props);
    this.foo = 100;
  }
  render() {
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
      </div>
    )
  }
}
