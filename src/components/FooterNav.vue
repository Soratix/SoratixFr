<template>
    <footer class="footer-nav border-top border-secondary py-2 px-3 d-flex justify-content-around">
      <button
        v-for="(label, key) in sections"
        :key="key"
        @click="select(key)"
        :class="['btn btn-link text-decoration-none fw-bold', { 'active-page': current === key, 'text-light': current !== key }]">
        {{ label }}
      </button>
    </footer>
  </template>
  
  <script setup>
  const props = defineProps({ current: String })
  const emit = defineEmits(['change'])
  
  const select = (section) => emit('change', section)
  
  const sections = {
    home: 'Accueil',
    projects: 'Projets',
  }
  </script>
  
  <style scoped>
  .footer-nav {
    z-index: 100;
    backdrop-filter: blur(6px);
    padding-bottom: 10px;;
  }
  
  .active-page {
    color: #6A0DAD !important; /* Couleur personnalisée pour la page active */
    text-decoration: underline;
  }
  
  button:hover {
    color: #6A0DAD !important;
    transform: scale(1.05);
    transition: all 0.2s ease;
  }
  </style>
