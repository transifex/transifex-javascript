<template>
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
      <T _str="Text {somevalue}" somevalue="something"/>
      <T _str="Text {someothervalue}" :somevalue="someothervalue"/>
      <UT _str="<b>HTML text</b>" _tags="tag1" />
      <UT _str="<b>HTML inline text</b>" _inline="true" />
      {{$t('Text 5')}}
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    setup() {
        t('Text 6')
    },
})
</script>
