<template>
  <select
    :class="className"
    v-model="selected"
    @change="onChange($event)"
  >
    <option v-for="language in languages"
      :key="language.code"
      :value="language.code">
      {{ language.name }}
    </option>
  </select>
</template>

<script>
import { ws } from '@wordsmith/native';

export default {
  name: 'LanguagePicker',
  props: {
    className: {
      type: String,
    },
  },
  methods: {
    async getLanguages() {
      this.languages = await ws.getLanguages();
    },
    onChange(e) {
      ws.setCurrentLocale(e.target.value);
    },
  },
  mounted() {
    this.getLanguages();
  },
  data() {
    return {
      selected: ws.getCurrentLocale(),
      languages: [],
    };
  },
};
</script>
