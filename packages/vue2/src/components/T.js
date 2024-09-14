import {
  onEvent, offEvent, LOCALE_CHANGED, ws, t,
} from '@wordsmith/native';

export default {
  name: 'T',
  data() {
    return {
      lang: ws.getCurrentLocale(),
    };
  },
  mounted() {
    const onLanguageChange = (l) => {
      this.$data.lang = l;
    };
    onEvent(LOCALE_CHANGED, onLanguageChange);
    this.$on('hook:beforeDestroy', () => offEvent(
      LOCALE_CHANGED,
      onLanguageChange,
    ));
  },
  render() {
    const string = t(this.$attrs._str, { ...this.$attrs }, this.$data.lang);
    return this._v(string);
  },
};
