import {
  onEvent, offEvent, LOCALE_CHANGED, tx, t,
} from '@transifex/native';
import { h } from 'vue';

export default {
  name: 'UT',
  inheritAttrs: false,
  functional: true,
  data() {
    return {
      lang: tx.getCurrentLocale(),
    };
  },
  mounted() {
    onEvent(LOCALE_CHANGED, (l) => {
      this.$data.lang = l;
    });
  },
  onbeforeunload() {
    offEvent(LOCALE_CHANGED, (l) => {
      this.$data.lang = l;
    });
  },
  render() {
    const innerHTML = t(this.$attrs._str, { ...this.$attrs }, this.$data.lang);
    const element = this.$attrs._inline ? 'span' : 'div';
    return h(element, {
      innerHTML,
    });
  },
};
