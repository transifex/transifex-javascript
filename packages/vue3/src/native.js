import {
  onEvent, LOCALE_CHANGED, t, tx,
} from '@transifex/native';
import { ref } from 'vue';
import T from './components/T';
import UT from './components/UT';

export default {
  install(app) {
    const locale = ref(tx.getCurrentLocale());

    onEvent(LOCALE_CHANGED, (l) => {
      locale.value = l;
    });

    // eslint-disable-next-line no-param-reassign
    app.trans = (string, options) => t(string, options, locale.value);
    app.mixin({
      computed: {
        $t() {
          return (key, options) => app.trans(key, options);
        },
      },
    });
    app.component('T', T);
    app.component('UT', UT);
  },
};
