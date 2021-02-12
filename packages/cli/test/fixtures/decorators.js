import React, { Component } from 'react';
import { T } from '@transifex/react'
import { t } from '@transifex/native'
import Controller from './Controller';

@Controller
class TestComponent extends Component {
  render() {
    return (
      <p>
        <T _str="Component with decorator" />
      </p>
    );
  }
}

@annotation
class TestClass1 {}
function annotation(target) {
   target.annotated = true;
   target.text = t('TestClass1 example');
}

@isTestable(true)
class TestClass2 { }
function isTestable(value) {
   return function decorator(target) {
      target.isTestable = value;
      target.text = t('TestClass2 example');
   }
}

class TestClass3 {
  @enumerable(false)
  method() {
    this.text = t('TestClass3 example');
  }
}
function enumerable(value) {
  return function (target, key, descriptor) {
     descriptor.enumerable = value;
     return descriptor;
  }
}

export default TestComponent;
