import {
  onEvent, LOCALE_CHANGED, t, tx,
} from '@transifex/native';
import T from './components/T';
import UT from './components/UT';

export default {
  install(Vue) {
    const data = { locale: tx.getCurrentLocale() };
    const vm = new Vue({ data });
    onEvent(LOCALE_CHANGED, (l) => {
      vm.$set(vm, 'locale', l);
    });

    // eslint-disable-next-line no-param-reassign
    Vue.trans = (string, options, locale) => t(string, options, locale);
    Vue.mixin({
      methods: {
        t(key, options) {
          return Vue.trans(key, options, vm.locale);
        },
      },
      computed: {
        $t() {
          return (key, options) => Vue.trans(key, options, vm.locale);
        },
      },
    });
    Vue.component('T', T);
    Vue.component('UT', UT);
  },
};
