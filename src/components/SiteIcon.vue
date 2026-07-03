<template>
  <img
    :src="currentSrc"
    :alt="alt"
    class="project-icon"
    loading="lazy"
    decoding="async"
    @error="tryNextSource"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getSiteIconUrls } from '@/utils/siteIcon'

const props = defineProps<{
  domain: string
  alt?: string
}>()

const sources = ref<string[]>([])
const index = ref(0)
const currentSrc = ref('')

function resetSources() {
  sources.value = getSiteIconUrls(props.domain)
  index.value = 0
  currentSrc.value = sources.value[0] ?? ''
}

function tryNextSource() {
  if (index.value >= sources.value.length - 1) return
  index.value += 1
  currentSrc.value = sources.value[index.value] ?? ''
}

watch(
  () => props.domain,
  () => resetSources(),
  { immediate: true },
)
</script>
