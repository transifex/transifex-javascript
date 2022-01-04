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
import { tx } from '@transifex/native';

export default {
  name: 'LanguagePicker',
  props: {
    className: {
      type: String,
    },
  },
  methods: {
    async getLanguages() {
      this.languages = await tx.getLanguages();
    },
    onChange(e) {
      tx.setCurrentLocale(e.target.value);
    },
  },
  mounted() {
    this.getLanguages();
  },
  data() {
    return {
      selected: tx.getCurrentLocale(),
      languages: [],
    };
  },
};
</script>
