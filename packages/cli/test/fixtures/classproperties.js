import { t } from '@wordsmith/native';

class TestClass1 {
  //Property initializer syntax
  instanceProperty = t('Instance property text');
  instanceProperty2 = 'Hello';
  boundFunction = () => {
    return this.instanceProperty;
  };

  //Static class properties
  static staticProperty = t('Static Property text');
  static staticFunction = function() {
    const text = t('Static Function text');
    return TestClass1.staticProperty;
  };
}
