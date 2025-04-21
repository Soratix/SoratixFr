<template>
  <!-- Section principale contenant les projets -->
  <section class="container-fluid py-4 d-flex flex-column flex-grow-1" id="projects">
    <!-- Titre principal de la section -->
    <h2 class="text-center text-gradient fw-bold display-5">Mes projets</h2>

    <!-- Section pour les icônes des technologies (filtrage) -->
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
        /> <!-- L'image de la technologie (icône) est récupérée -->
        <small class="text-light d-block text-center mt-2">{{ tech.label }}</small>  <!-- Label sous l'icône -->
      </div>
    </div>

    <!-- Affichage des projets filtrés -->
    <div class="row flex-grow-1 flex-wrap justify-content-center" id="projects-list">
      <div v-for="project in paginatedProjects" > 
        :key="project.name"                <!-- Utilisation du nom du projet comme clé unique -->
        class="justify-content-center col-12 col-lg-2 mb-4"
      >
        <div class="card text-center">
          <div class="card-body">
            <h4 class="card-title">{{project.name}}</h4>   <!-- Nom du projet -->
            <img :src="project.icon" :alt="project.name" class="project-icon mb-3 mx-auto" />  <!-- Icône du projet -->
            <p class="card-text">{{project.description}}</p>  <!-- Description du projet -->
            <div class="d-flex justify-content-center mb-3">
              <!-- Lien vers la version live du projet, si disponible -->
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
              <!-- Lien vers le code source du projet, si disponible -->
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

    <!-- Pagination (si plus d'une page de projets) -->
    <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4" id="pagination" v-if="totalPages > 1">
      <!-- Bouton pour aller à la page précédente -->
      <button
        class="custom-button"
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        :class="{ disabled: currentPage === 1 }"
      >
        ← Précédent
      </button>

      <!-- Affichage de la page actuelle et du nombre total de pages -->
      <span class="text-light fw-medium">Page {{ currentPage }} sur {{ totalPages }}</span>

      <!-- Bouton pour aller à la page suivante -->
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

  const currentPage = ref(1)  // Page actuelle de la pagination, initialisée à 1
  const selectedTech = ref('web')  // Technologie sélectionnée, initialisée à 'web'
  const projectsPerPage = ref(6)  // Nombre de projets par page, ajusté selon la taille de l'écran

  // Liste des technologies disponibles pour filtrer les projets
  const technos = [
    { key: 'web', label: 'Internet', img: webIcon },
    { key: 'android', label: 'Android', img: androidIcon }
  ]

  // Liste de tous les projets, avec des informations comme le nom, la description, etc.
  const allProjects = [
    { name: 'Soratix.fr', description: 'Le site vitrine sur le quel vous êtes présent', linkLive: '', linkCode: 'https://github.com/Soratix/SoratixFr', icon: getFaviconURL("http://Soratix.fr"), tech: 'web' },
    { name: 'CardTracker', description: 'Un outil de gestion de cartes a collectionner.', linkLive: 'https://cardtracker.soratix.fr', linkCode: '', icon: getFaviconURL("http://CardTracker.Soratix.fr"), tech: 'web' },
    { name: 'TBA', description: 'Un projet mobile à venir...', linkLive: '', linkCode: '', icon: androidIcon, tech: 'android' },
    // D'autres projets peuvent être ajoutés ici...
  ]

  // Fonction pour générer l'URL de la favicon d'un site
  function getFaviconURL(siteURL) {
    const baseFaviconURL = "https://www.google.com/s2/favicons?sz=64&domain_url=";
    return baseFaviconURL + encodeURIComponent(siteURL);
  }

  // Computed pour filtrer les projets en fonction de la technologie sélectionnée
  const filteredProjects = computed(() =>
    allProjects.filter(p => p.tech === selectedTech.value)
  )

  // Fonction pour mettre à jour le nombre de projets par page en fonction de la taille de l'écran
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

  // Fonction qui gère l'événement de redimensionnement de la fenêtre pour ajuster les projets par page
  const handleResize = () => {
    updateProjectsPerPage()
  }

  // Lors du montage du composant, on configure le nombre de projets par page et on écoute l'événement de redimensionnement
  onMounted(() => {
    updateProjectsPerPage()
    window.addEventListener('resize', handleResize)
  })

  // Lors du démontage du composant, on supprime l'écouteur d'événements
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  // Calculer le nombre total de pages en fonction des projets filtrés et du nombre de projets par page
  const totalPages = computed(() => Math.ceil(filteredProjects.value.length / projectsPerPage.value))

  // Calculer les projets à afficher pour la page actuelle
  const paginatedProjects = computed(() => {
    const startIndex = (currentPage.value - 1) * projectsPerPage.value
    return filteredProjects.value.slice(startIndex, startIndex + projectsPerPage.value)
  })

  // Fonction pour changer de page
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Fonctions pour naviguer entre les pages précédente et suivante
  const goToPreviousPage = () => {
    if (currentPage.value > 1) currentPage.value--
  }

  const goToNextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
  }
</script>
  
<style scoped>
</style>