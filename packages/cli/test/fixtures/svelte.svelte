<script>
import { t } from '@transifex/native'

const x = t('Text 6')
</script>

<div>
  {t('Text 1', { _context: 'foo', _tags: 'tag1,tag2', _charlimit: 10, _comment: 'comment' })}
  {t('Text 2')}
  {t("Text {somevalue}", {somevalue: "something"})}
  <div data-test="{t('Text 3')}"></div>
  {#each [t('Text 4')] as x}
  {@const y = t('Text 5')}
  {/each}
</div>
