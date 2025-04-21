<template>
    <section class="container-fluid py-4 d-flex flex-column flex-grow-1" id="projects">
      <!-- Titre principal -->
      <h2 class="text-center text-gradient fw-bold display-5">Mes projets</h2>
  
      <!-- Icônes technos (filtrage) -->
      <div class="d-flex justify-content-center gap-4 mt-2">
        <div
          v-for="tech in technos"
          :key="tech.key"
          class="tech-icon-wrapper"
          @click="selectedTech = tech.key"
          :class="{ active: selectedTech === tech.key }"
        >
          <img
            :src="tech.img"
            :alt="tech.label"
            class="tech-icon"
          />
          <small class="text-light d-block text-center mt-2">{{ tech.label }}</small>
        </div>
      </div>
  
      <!-- Affichage des projets filtrés -->
      <div class="row flex-grow-1 flex-wrap justify-content-center" id="projects-list">
        <div v-for="project in paginatedProjects"
          :key="project.name"
          class="justify-content-center col-12 col-lg-2 mb-4"
        >
          <div class="card text-center">
            <div class="card-body">
              <h4 class="card-title">{{project.name}}</h4>
              <img :src="project.icon" :alt="project.name" class="project-icon mb-3 mx-auto" />
              <p class="card-text">{{project.description}}</p>
              <div class="d-flex justify-content-center mb-3">
                <a 
                  v-if="project.linkLive" 
                  :href="project.linkLive"
                  class="custom-button live"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                Live
                </a>
                <span v-show="project.linkLive && project.linkCode" class="mx-2"></span>
                <a
                  v-if="project.linkCode"
                  :href="project.linkCode"
                  class="custom-button code"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                Code
                </a>
              </div>
            </div>
          </div>
        </div> 
      </div>
  
    <!-- Pagination -->
    <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4" id="pagination" v-if="totalPages > 1">
      <button
        class="custom-button"
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        :class="{ disabled: currentPage === 1 }"
      >
        ← Précédent
      </button>

      <span class="text-light fw-medium">Page {{ currentPage }} sur {{ totalPages }}</span>

      <button
        class="custom-button"
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        :class="{ disabled: currentPage === totalPages }"
      >
        Suivant →
      </button>
    </div>
    </section>
  </template>
  
  
  <script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import webIcon from '@/assets/icons/web.svg'
import androidIcon from '@/assets/icons/android.svg'

const currentPage = ref(1)
const selectedTech = ref('web')
const projectsPerPage = ref(6) // Initialiser à une valeur par défaut, mais va être recalculé selon l'écran

const technos = [
  { key: 'web', label: 'Internet', img: webIcon },
  { key: 'android', label: 'Android', img: androidIcon }
]

const allProjects = [
  { name: 'CardTracker', description: 'Un outil de gestion pour collections de cartes.', linkLive: 'https://cardtracker.soratix.fr', linkCode: '', icon: "https://www.google.com/s2/favicons?sz=64&domain_url=https://bootswatch.com/lumen/", tech: 'web' },
  { name: 'Projet Android Secret', description: 'Un projet mobile à venir...', linkLive: '', linkCode: '', icon: androidIcon, tech: 'android' },
  // Ajoute ici d'autres projets...
]

const filteredProjects = computed(() =>
  allProjects.filter(p => p.tech === selectedTech.value)
)

const updateProjectsPerPage = () => {
  const width = window.innerWidth
  if (width >= 1620) {
    projectsPerPage.value = 12
  } else if (width >= 1200) {
    projectsPerPage.value = 10
  } else if (width >= 992) {
    projectsPerPage.value = 8
  } else if (width >= 768) {
    projectsPerPage.value = 6
  } else if (width >= 576) {
    projectsPerPage.value = 4
  } else {
    projectsPerPage.value = 2
  }
}

const handleResize = () => {
  updateProjectsPerPage()
}

onMounted(() => {
  updateProjectsPerPage()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Calculer le nombre total de pages
const totalPages = computed(() => Math.ceil(filteredProjects.value.length / projectsPerPage.value))

// Calculer les projets à afficher en fonction de la page actuelle
const paginatedProjects = computed(() => {
  const startIndex = (currentPage.value - 1) * projectsPerPage.value
  return filteredProjects.value.slice(startIndex, startIndex + projectsPerPage.value)
})

// Changer de page
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>
  
<style scoped>

</style>