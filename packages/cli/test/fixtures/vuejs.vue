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
      <div>{{$t('Text 7')}}</div>
      <div v-if="condition == 'something'">
        <div>
          <div><p>{{$t('Text 8')}}</p></div>
        </div>
      </div>
      <span>{{ t(`Text 9 with siblings`) }}<sup>*</sup></span>
      <SomeComponent :aprop="t('A prop string')"/>
      <p>
        Try out <a href="some" target="string">simple dom</a> doesn't break
          things
      </p>
      <Comp :to="{
        aprop: `${avariable}`,
        anotherprop: {
          something: 'something',
        }}"
      />
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    setup() {
        t('Text in script')
    },
})
</script>

<script setup>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    setup() {
        t('Text in script setup')
    },
})
</script>
