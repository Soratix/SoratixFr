<template>
  <section class="container-fluid py-4 d-flex flex-column flex-grow-1" id="creations">
    <h2 class="text-center text-gradient fw-bold display-5">Mes créations</h2>
    <p class="text-center text-secondary mb-4">
      Applications, outils et projets hébergés sur Soratix
    </p>

    <div v-if="categories.length" class="d-flex justify-content-center flex-wrap gap-4 mt-2 mb-3">
      <div
        v-for="category in categories"
        :key="category.key"
        class="tech-icon-wrapper"
        @click="selectedCategory = category.key"
        :class="{ active: selectedCategory === category.key }"
      >
        <img :src="resolveCategoryIcon(category.icon)" :alt="category.label" class="tech-icon" />
        <small class="text-light d-block text-center mt-2">{{ category.label }}</small>
      </div>
    </div>

    <div v-if="loading" class="text-center text-secondary py-5">Chargement…</div>

    <div v-else-if="filteredItems.length === 0" class="text-center text-secondary py-5">
      Aucune création disponible pour cette catégorie.
    </div>

    <div v-else class="row justify-content-center" id="creations-list">
      <div
        v-for="item in paginatedItems"
        :key="item.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-4"
      >
        <div class="card text-center creation-card">
          <div class="card-body">
            <h4 class="card-title">{{ item.name }}</h4>
            <SiteIcon :domain="item.iconDomain" :alt="item.name" class="mb-3 mx-auto" />
            <p class="card-text">{{ item.description }}</p>

            <div class="mb-2">
              <span v-if="item.subdomain || item.url" class="badge subdomain-badge">
                {{ displaySubdomain(item) }}
              </span>
              <span class="badge ms-2" :class="statusClass(item.status)">
                {{ statusLabel(item.status) }}
              </span>
            </div>

            <div v-if="item.technologies.length" class="d-flex flex-wrap justify-content-center gap-1 mb-3">
              <span v-for="tech in item.technologies" :key="tech" class="badge tech-badge">{{ tech }}</span>
            </div>

            <div class="d-flex justify-content-center gap-2">
              <a
                v-if="item.url"
                :href="item.url"
                class="custom-button live"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir
              </a>
              <a
                v-if="item.repoUrl"
                :href="item.repoUrl"
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

    <div
      v-if="totalPages > 1"
      class="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4"
      id="pagination"
    >
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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  loadHubData,
  getPublicTools,
  getCategories,
} from '@/composables/useTools'
import SiteIcon from '@/components/SiteIcon.vue'
import { resolveCategoryIcon } from '@/utils/categoryIcons'
import type { Category, Tool, ToolStatus } from '@/types/tool'

const loading = ref(true)
const selectedCategory = ref('')
const categories = ref<Category[]>([])
const publicItems = ref<Tool[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(6)

const filteredItems = computed(() =>
  publicItems.value.filter((item) => item.category === selectedCategory.value),
)

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredItems.value.slice(start, start + itemsPerPage.value)
})

watch(selectedCategory, () => {
  currentPage.value = 1
})

function updateItemsPerPage() {
  const width = window.innerWidth
  if (width >= 1620) itemsPerPage.value = 12
  else if (width >= 1200) itemsPerPage.value = 10
  else if (width >= 992) itemsPerPage.value = 8
  else if (width >= 768) itemsPerPage.value = 6
  else if (width >= 576) itemsPerPage.value = 4
  else itemsPerPage.value = 2
}

onMounted(async () => {
  updateItemsPerPage()
  window.addEventListener('resize', updateItemsPerPage)
  await loadHubData()
  categories.value = getCategories()
  publicItems.value = getPublicTools()
  selectedCategory.value = categories.value[0]?.key ?? ''
  loading.value = false
})

onUnmounted(() => {
  window.removeEventListener('resize', updateItemsPerPage)
})

function displaySubdomain(item: Tool): string {
  return item.subdomain ? `${item.subdomain}.soratix.fr` : 'soratix.fr'
}

function statusLabel(status: ToolStatus): string {
  return { live: 'En ligne', dev: 'En dev', planned: 'Prévu' }[status]
}

function statusClass(status: ToolStatus): string {
  return { live: 'status-live', dev: 'status-dev', planned: 'status-planned' }[status]
}

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<style scoped>
.subdomain-badge {
  background-color: rgba(106, 13, 173, 0.35);
  color: #ebd6f8;
  font-weight: 500;
}

.tech-badge {
  background-color: rgba(0, 255, 195, 0.12);
  color: #00ffc3;
  border: 1px solid rgba(0, 255, 195, 0.25);
}

.status-live {
  background-color: rgba(0, 255, 195, 0.15);
  color: #00ffc3;
}

.status-dev {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.status-planned {
  background-color: rgba(108, 117, 125, 0.25);
  color: #adb5bd;
}

.tool-card:hover,
.creation-card:hover {
  transform: translateY(-4px);
  box-shadow: #6a0dad 0px 4px 20px 0px;
}

.creation-card {
  height: auto;
}

.creation-card .card-body {
  height: auto;
  justify-content: flex-start;
}
</style>
