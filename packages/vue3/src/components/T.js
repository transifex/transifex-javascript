import {
  onEvent, offEvent, LOCALE_CHANGED, ws, t,
} from '@wordsmith/native';
import { Text, h } from 'vue';

export default {
  name: 'T',
  data() {
    return {
      lang: ws.getCurrentLocale(),
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
    const string = t(this.$attrs._str, { ...this.$attrs }, this.$data.lang);
    return h(Text, string);
  },
};
