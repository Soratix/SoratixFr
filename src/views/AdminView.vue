<template>
  <div class="admin-page min-vh-100 text-light py-4">
    <div class="container">
      <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 class="text-gradient fw-bold mb-1">Panel Admin</h1>
          <p class="text-secondary mb-0">Gérez vos créations, catégories et données Soratix</p>
        </div>
        <router-link to="/" class="custom-button">← Retour au hub</router-link>
      </header>

      <div v-if="authLoading" class="admin-card mx-auto text-center" style="max-width: 420px">
        <p class="text-secondary mb-0">Vérification de la session…</p>
      </div>

      <div v-else-if="!isAuthenticated" class="admin-card mx-auto text-center" style="max-width: 420px">
        <h2 class="h4 mb-3">Connexion admin</h2>
        <p class="text-secondary small mb-4">
          Seul votre compte Discord autorisé peut accéder à ce panel.
        </p>
        <p v-if="authError" class="text-danger small mb-3">{{ authError }}</p>
        <button type="button" class="custom-button discord-login w-100" @click="loginWithDiscord">
          <span class="discord-icon">&#9670;</span>
          Se connecter avec Discord
        </button>
      </div>

      <div v-else>
        <div class="admin-user-bar d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div class="d-flex align-items-center gap-2">
            <img
              v-if="discordAvatarUrl"
              :src="discordAvatarUrl"
              alt=""
              class="discord-avatar"
            />
            <span class="text-secondary small">
              Connecté en tant que <strong class="text-light">{{ displayName }}</strong>
            </span>
          </div>
          <button type="button" class="custom-button code" @click="handleLogout">Déconnexion</button>
        </div>
        <nav class="admin-tabs d-flex flex-wrap gap-2 mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="admin-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span v-if="tab.badge !== undefined" class="tab-badge">{{ tab.badge }}</span>
          </button>
        </nav>

        <!-- Onglet Créations -->
        <div v-show="activeTab === 'creations'" class="row g-4">
          <div class="col-lg-5">
            <div class="admin-card sticky-form">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 mb-0">{{ editingToolId ? 'Modifier' : 'Nouvelle création' }}</h2>
                <button v-if="editingToolId" type="button" class="custom-button" @click="cancelToolEdit">
                  Annuler
                </button>
              </div>
              <form @submit.prevent="handleToolSubmit">
                <div class="mb-3">
                  <label class="form-label">Nom</label>
                  <input v-model="toolForm.name" type="text" class="form-control admin-input" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea v-model="toolForm.description" class="form-control admin-input" rows="2" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Sous-domaine</label>
                  <div class="input-group">
                    <input
                      v-model="toolForm.subdomain"
                      type="text"
                      class="form-control admin-input"
                      placeholder="cardtracker"
                      @input="syncUrlFromSubdomain"
                    />
                    <span class="input-group-text admin-addon">.soratix.fr</span>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">URL complète</label>
                  <input v-model="toolForm.url" type="url" class="form-control admin-input" />
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Catégorie</label>
                    <select v-model="toolForm.category" class="form-select admin-input" required>
                      <option v-for="cat in allCategories" :key="cat.key" :value="cat.key">
                        {{ cat.label }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Statut</label>
                    <select v-model="toolForm.status" class="form-select admin-input">
                      <option value="live">En ligne</option>
                      <option value="dev">En développement</option>
                      <option value="planned">Prévu</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Technologies (virgules)</label>
                  <input
                    v-model="toolForm.technologies"
                    type="text"
                    class="form-control admin-input"
                    placeholder="vue, vite, typescript"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Domaine pour l'icône</label>
                  <input v-model="toolForm.iconDomain" type="text" class="form-control admin-input" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Repo GitHub (optionnel)</label>
                  <input v-model="toolForm.repoUrl" type="url" class="form-control admin-input" />
                </div>
                <div class="form-check mb-3">
                  <input id="public" v-model="toolForm.public" class="form-check-input" type="checkbox" />
                  <label class="form-check-label" for="public">Visible sur le hub public</label>
                </div>
                <button type="submit" class="custom-button live w-100">
                  {{ editingToolId ? 'Enregistrer les modifications' : 'Ajouter la création' }}
                </button>
              </form>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="admin-card">
              <h2 class="h5 mb-3">Créations ({{ allTools.length }})</h2>
              <div v-if="allTools.length === 0" class="text-secondary">Aucune création pour le moment.</div>
              <div v-for="tool in allTools" :key="tool.id" class="admin-row mb-3 p-3">
                <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
                  <div>
                    <h3 class="h6 mb-1 text-gradient">{{ tool.name }}</h3>
                    <p class="small text-secondary mb-2">{{ tool.description }}</p>
                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge subdomain-badge">{{ categoryLabel(tool.category) }}</span>
                      <span class="badge subdomain-badge">
                        {{ tool.subdomain ? `${tool.subdomain}.soratix.fr` : 'soratix.fr' }}
                      </span>
                      <span class="badge" :class="statusClass(tool.status)">{{ statusLabel(tool.status) }}</span>
                      <span v-if="!tool.public" class="badge bg-secondary">Privé</span>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <a
                      v-if="tool.url"
                      :href="tool.url"
                      class="custom-button live"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ouvrir
                    </a>
                    <button class="custom-button" @click="startToolEdit(tool)">Modifier</button>
                    <button class="custom-button code" @click="handleToolDelete(tool.id)">Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Catégories -->
        <div v-show="activeTab === 'categories'" class="row g-4">
          <div class="col-lg-5">
            <div class="admin-card sticky-form">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 mb-0">{{ editingCategoryKey ? 'Modifier' : 'Nouvelle catégorie' }}</h2>
                <button
                  v-if="editingCategoryKey"
                  type="button"
                  class="custom-button"
                  @click="cancelCategoryEdit"
                >
                  Annuler
                </button>
              </div>
              <form @submit.prevent="handleCategorySubmit">
                <div class="mb-3">
                  <label class="form-label">Identifiant (slug)</label>
                  <input
                    v-model="categoryForm.key"
                    type="text"
                    class="form-control admin-input"
                    placeholder="web, mobile, jeux…"
                    :disabled="!!editingCategoryKey"
                    required
                  />
                  <small class="text-secondary">Utilisé en interne, sans espaces</small>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nom affiché</label>
                  <input v-model="categoryForm.label" type="text" class="form-control admin-input" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Icône</label>
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <button
                      v-for="icon in availableIcons"
                      :key="icon.key"
                      type="button"
                      class="icon-picker"
                      :class="{ active: categoryForm.icon === icon.key }"
                      @click="selectBuiltInIcon(icon.key)"
                    >
                      <img :src="icon.preview" :alt="icon.label" />
                      <span>{{ icon.label }}</span>
                    </button>
                  </div>

                  <div class="icon-upload-zone mb-2">
                    <img
                      v-if="categoryIconPreview"
                      :src="categoryIconPreview"
                      alt="Aperçu"
                      class="category-preview mb-2"
                    />
                    <label class="custom-button mb-0">
                      Importer un SVG
                      <input
                        type="file"
                        accept=".svg,image/svg+xml"
                        class="d-none"
                        @change="handleIconUpload"
                      />
                    </label>
                    <button
                      v-if="isCustomIcon(categoryForm.icon)"
                      type="button"
                      class="custom-button code ms-2"
                      @click="clearCustomIcon"
                    >
                      Retirer l'upload
                    </button>
                  </div>
                  <small class="text-secondary">
                    Choisissez une icône intégrée ou importez un fichier SVG (stocké dans le JSON exporté).
                  </small>
                </div>
                <button type="submit" class="custom-button live w-100">
                  {{ editingCategoryKey ? 'Enregistrer la catégorie' : 'Ajouter la catégorie' }}
                </button>
              </form>
            </div>
          </div>

          <div class="col-lg-7">
            <div class="admin-card">
              <h2 class="h5 mb-3">Catégories ({{ allCategories.length }})</h2>
              <div v-for="category in allCategories" :key="category.key" class="admin-row mb-3 p-3">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div class="d-flex align-items-center gap-3">
                    <img
                      :src="resolveCategoryIcon(category.icon)"
                      :alt="category.label"
                      class="category-preview"
                    />
                    <div>
                      <h3 class="h6 mb-1 text-gradient">{{ category.label }}</h3>
                      <p class="small text-secondary mb-0">
                        Clé : <code>{{ category.key }}</code> ·
                        {{ countToolsInCategory(category.key) }} création(s)
                      </p>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button class="custom-button" @click="startCategoryEdit(category)">Modifier</button>
                    <button
                      class="custom-button code"
                      :disabled="countToolsInCategory(category.key) > 0"
                      :class="{ disabled: countToolsInCategory(category.key) > 0 }"
                      @click="handleCategoryDelete(category.key)"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
              <p class="small text-secondary mb-0 mt-3">
                Une catégorie ne peut être supprimée que si aucune création ne l'utilise.
              </p>
            </div>
          </div>
        </div>

        <!-- Onglet Données -->
        <div v-show="activeTab === 'data'">
          <div class="admin-card mb-4">
            <h2 class="h5 mb-3">Synchronisation</h2>
            <div class="alert admin-alert mb-4">
              Les modifications sont sauvegardées localement dans votre navigateur.
              Pour les publier en production, exportez le JSON puis remplacez
              <code>public/tools.json</code> avant de déployer.
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button class="custom-button live" @click="handleExport">Exporter JSON</button>
              <label class="custom-button mb-0">
                Importer JSON
                <input type="file" accept="application/json" class="d-none" @change="handleImport" />
              </label>
              <button class="custom-button" @click="handleReset">Réinitialiser depuis tools.json</button>
            </div>
          </div>

          <div class="admin-card">
            <h2 class="h5 mb-3">Compte Discord</h2>
            <p class="text-secondary small mb-3">
              Connecté en tant que {{ displayName }}
            </p>
            <button class="custom-button code" @click="handleLogout">Déconnexion</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  loadHubData,
  getAllTools,
  getCategories,
  addTool,
  updateTool,
  removeTool,
  addCategory,
  updateCategory,
  removeCategory,
  countToolsInCategory,
  exportHubJson,
  importHubJson,
  clearLocalOverride,
  resetHubCache,
  buildToolUrl,
} from '@/composables/useTools'
import { useAuth } from '@/composables/useAuth'
import { AVAILABLE_ICONS, resolveCategoryIcon, getCategoryLabel } from '@/utils/categoryIcons'
import { readSvgFile, isCustomIcon } from '@/utils/svgUpload'
import type { Category, Tool, ToolDraft, ToolStatus, CategoryDraft } from '@/types/tool'

type AdminTab = 'creations' | 'categories' | 'data'

const route = useRoute()
const router = useRouter()
const {
  isAuthenticated,
  user,
  authError,
  authLoading,
  checkAuth,
  setAuthErrorFromQuery,
  loginWithDiscord,
  logout,
} = useAuth()
const activeTab = ref<AdminTab>('creations')
const allTools = ref<Tool[]>([])
const allCategories = ref<Category[]>([])
const editingToolId = ref<string | null>(null)
const editingCategoryKey = ref<string | null>(null)

const availableIcons = AVAILABLE_ICONS

const displayName = computed(() => user.value?.global_name || user.value?.username || 'Admin')

const discordAvatarUrl = computed(() => {
  if (!user.value?.id || !user.value.avatar) return null
  return `https://cdn.discordapp.com/avatars/${user.value.id}/${user.value.avatar}.png?size=64`
})

const tabs = computed(() => [
  { id: 'creations' as const, label: 'Créations', badge: allTools.value.length },
  { id: 'categories' as const, label: 'Catégories', badge: allCategories.value.length },
  { id: 'data' as const, label: 'Données' },
])

const emptyToolForm = (): ToolDraft => ({
  name: '',
  description: '',
  subdomain: '',
  url: '',
  category: allCategories.value[0]?.key ?? 'web',
  technologies: '',
  status: 'dev',
  public: true,
  iconDomain: '',
  repoUrl: '',
})

const emptyCategoryForm = (): CategoryDraft => ({
  key: '',
  label: '',
  icon: 'web',
})

const toolForm = reactive<ToolDraft>(emptyToolForm())
const categoryForm = reactive<CategoryDraft>(emptyCategoryForm())

const categoryIconPreview = computed(() => resolveCategoryIcon(categoryForm.icon))

onMounted(async () => {
  const error = typeof route.query.error === 'string' ? route.query.error : null
  if (error) {
    setAuthErrorFromQuery(error)
    router.replace({ path: '/admin' })
  }

  await checkAuth()
  if (isAuthenticated.value) {
    await refreshData()
  }
})

async function refreshData() {
  await loadHubData(true)
  allTools.value = getAllTools()
  allCategories.value = getCategories()
  if (!toolForm.category && allCategories.value[0]) {
    toolForm.category = allCategories.value[0].key
  }
}

function selectBuiltInIcon(key: string) {
  categoryForm.icon = key
}

async function handleIconUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    categoryForm.icon = await readSvgFile(file)
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Import SVG impossible.')
  } finally {
    input.value = ''
  }
}

function clearCustomIcon() {
  categoryForm.icon = 'web'
}

async function handleLogout() {
  await logout()
}

function categoryLabel(key: string): string {
  return getCategoryLabel(allCategories.value, key)
}

function syncUrlFromSubdomain() {
  toolForm.url = buildToolUrl(toolForm.subdomain)
  if (!toolForm.iconDomain || toolForm.iconDomain.endsWith('soratix.fr')) {
    toolForm.iconDomain = toolForm.subdomain
      ? `${toolForm.subdomain.trim()}.soratix.fr`
      : 'soratix.fr'
  }
}

function startToolEdit(tool: Tool) {
  editingToolId.value = tool.id
  activeTab.value = 'creations'
  Object.assign(toolForm, {
    name: tool.name,
    description: tool.description,
    subdomain: tool.subdomain,
    url: tool.url,
    category: tool.category,
    technologies: tool.technologies.join(', '),
    status: tool.status,
    public: tool.public,
    iconDomain: tool.iconDomain,
    repoUrl: tool.repoUrl ?? '',
  })
}

function cancelToolEdit() {
  editingToolId.value = null
  Object.assign(toolForm, emptyToolForm())
}

async function handleToolSubmit() {
  if (editingToolId.value) {
    updateTool(editingToolId.value, { ...toolForm })
  } else {
    addTool({ ...toolForm })
  }
  await refreshData()
  cancelToolEdit()
}

async function handleToolDelete(id: string) {
  if (!confirm('Supprimer cette création ?')) return
  removeTool(id)
  await refreshData()
  if (editingToolId.value === id) cancelToolEdit()
}

function startCategoryEdit(category: Category) {
  editingCategoryKey.value = category.key
  Object.assign(categoryForm, {
    key: category.key,
    label: category.label,
    icon: category.icon,
  })
}

function cancelCategoryEdit() {
  editingCategoryKey.value = null
  Object.assign(categoryForm, emptyCategoryForm())
}

async function handleCategorySubmit() {
  if (editingCategoryKey.value) {
    updateCategory(editingCategoryKey.value, { ...categoryForm })
  } else {
    const created = addCategory({ ...categoryForm })
    if (!created) {
      alert('Impossible d\'ajouter cette catégorie. Vérifiez que l\'identifiant est unique.')
      return
    }
  }
  await refreshData()
  cancelCategoryEdit()
}

async function handleCategoryDelete(key: string) {
  if (countToolsInCategory(key) > 0) {
    alert('Cette catégorie est utilisée par des créations. Déplacez-les avant de la supprimer.')
    return
  }
  if (!confirm('Supprimer cette catégorie ?')) return
  if (!removeCategory(key)) {
    alert('Impossible de supprimer cette catégorie.')
    return
  }
  await refreshData()
  if (editingCategoryKey.value === key) cancelCategoryEdit()
}

function handleExport() {
  const blob = new Blob([exportHubJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'tools.json'
  link.click()
  URL.revokeObjectURL(url)
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const text = await file.text()
  if (!importHubJson(text)) {
    alert('Fichier JSON invalide.')
    return
  }

  await refreshData()
  input.value = ''
}

async function handleReset() {
  if (!confirm('Réinitialiser et recharger depuis public/tools.json ?')) return
  clearLocalOverride()
  resetHubCache()
  await refreshData()
  cancelToolEdit()
  cancelCategoryEdit()
}

function statusLabel(status: ToolStatus): string {
  return { live: 'En ligne', dev: 'En dev', planned: 'Prévu' }[status]
}

function statusClass(status: ToolStatus): string {
  return { live: 'status-live', dev: 'status-dev', planned: 'status-planned' }[status]
}
</script>

<style scoped>
.discord-login {
  background-color: #5865f2;
  border-color: #5865f2;
  color: #fff;
  opacity: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.discord-login:hover {
  background-color: #4752c4;
  border-color: #4752c4;
  color: #fff;
  filter: none;
}

.discord-icon {
  font-size: 1.1rem;
}

.discord-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.admin-user-bar {
  padding: 0.75rem 1rem;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(106, 13, 173, 0.25);
  border-radius: 0.5rem;
}

.icon-upload-zone {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px dashed rgba(106, 13, 173, 0.35);
  border-radius: 0.5rem;
}

.admin-page {
  background-color: #14102a;
}

.admin-card {
  background-color: rgba(10, 8, 21, 0.85);
  border: 1px solid rgba(106, 13, 173, 0.35);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: #6a0dad 0 0 12px rgba(106, 13, 173, 0.25);
}

.sticky-form {
  position: sticky;
  top: 1rem;
}

.admin-tabs {
  border-bottom: 1px solid rgba(106, 13, 173, 0.35);
  padding-bottom: 0.5rem;
}

.admin-tab {
  background: transparent;
  border: 1px solid rgba(106, 13, 173, 0.35);
  color: #ccc;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-tab:hover {
  color: #ebd6f8;
  border-color: rgba(0, 255, 195, 0.3);
}

.admin-tab.active {
  color: #00ffc3;
  border-color: #00ffc3;
  background-color: rgba(0, 255, 195, 0.08);
  box-shadow: 0 0 8px rgba(0, 255, 195, 0.2);
}

.tab-badge {
  background-color: rgba(106, 13, 173, 0.5);
  color: #ebd6f8;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
}

.admin-tab.active .tab-badge {
  background-color: rgba(0, 255, 195, 0.2);
  color: #00ffc3;
}

.admin-input,
.admin-addon {
  background-color: #0a0715;
  border-color: rgba(106, 13, 173, 0.45);
  color: #f8f9fa;
}

.admin-input:focus {
  background-color: #0a0715;
  border-color: #00ffc3;
  color: #f8f9fa;
  box-shadow: 0 0 0 0.2rem rgba(0, 255, 195, 0.15);
}

.admin-addon {
  color: #adb5bd;
}

.admin-alert {
  background-color: rgba(106, 13, 173, 0.15);
  border: 1px solid rgba(106, 13, 173, 0.35);
  color: #ebd6f8;
}

.admin-row {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(106, 13, 173, 0.25);
  border-radius: 0.5rem;
}

.subdomain-badge {
  background-color: rgba(106, 13, 173, 0.35);
  color: #ebd6f8;
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

.icon-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(106, 13, 173, 0.35);
  border-radius: 0.5rem;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-picker img {
  width: 2rem;
  height: 2rem;
  filter: brightness(0) invert(1);
}

.icon-picker.active {
  border-color: #00ffc3;
  color: #00ffc3;
  background-color: rgba(0, 255, 195, 0.08);
}

.category-preview {
  width: 2.5rem;
  height: 2.5rem;
  filter: brightness(0) invert(1);
}
</style>
