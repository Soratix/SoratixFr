<template>
  <div class="d-flex flex-column min-vh-100 text-light">
    <!-- Contenu principal -->
    <div class="flex-grow-1 overflow-hidden position-relative">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" class="w-100" />
      </transition>
    </div>

    <!-- Footer -->
    <FooterNav :current="currentSection" @change="setSection" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import SectionHome from './components/SectionHome.vue'
import SectionProjects from './components/SectionProjects.vue'
import FooterNav from './components/FooterNav.vue'

const currentSection = ref('home')

const setSection = (section) => currentSection.value = section

const currentComponent = computed(() => {
  return {
    home: SectionHome,
    projects: SectionProjects,
  }[currentSection.value]
})
</script>

<style scoped>

</style>
