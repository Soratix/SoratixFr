<template>
  <div class="hub-layout d-flex flex-column text-light">
    <main ref="contentRef" class="hub-content flex-grow-1">
      <transition name="fade" mode="out-in" @after-enter="resetScroll">
        <component :is="currentComponent" :key="currentSection" class="hub-section" />
      </transition>
    </main>

    <FooterNav :current="currentSection" @change="setSection" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

import SectionHome from '@/components/SectionHome.vue'
import SectionCreations from '@/components/SectionCreations.vue'
import FooterNav from '@/components/FooterNav.vue'

type HubSection = 'home' | 'creations'

const currentSection = ref<HubSection>('home')
const contentRef = ref<HTMLElement | null>(null)

const setSection = async (section: HubSection) => {
  if (currentSection.value === section) return
  currentSection.value = section
  await nextTick()
  resetScroll()
}

function resetScroll() {
  contentRef.value?.scrollTo(0, 0)
  const section = contentRef.value?.querySelector('.hub-section') as HTMLElement | null
  section?.scrollTo(0, 0)
}

const currentComponent = computed(() => {
  const sections = {
    home: SectionHome,
    creations: SectionCreations,
  } as const

  return sections[currentSection.value]
})
</script>

<style scoped>
.hub-layout {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.hub-content {
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.hub-content :deep(.hub-section) {
  height: 100%;
  overflow: hidden;
}

.hub-content :deep(#creations) {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(106, 13, 173, 0.6) transparent;
  padding-bottom: 4rem;
}
</style>
