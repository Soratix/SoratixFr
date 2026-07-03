import { ref, readonly } from 'vue'
import type { Category, CategoryDraft, Tool, ToolsData, ToolDraft } from '@/types/tool'
import { getFaviconURL } from '@/utils/siteIcon'

const STORAGE_KEY = 'soratix-hub-data'
const BASE_DOMAIN = 'soratix.fr'

const DEFAULT_CATEGORIES: Category[] = [
  { key: 'web', label: 'Internet', icon: 'web' },
  { key: 'android', label: 'Android', icon: 'android' },
]

const categories = ref<Category[]>([...DEFAULT_CATEGORIES])
const tools = ref<Tool[]>([])
const loaded = ref(false)
const loading = ref(false)

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeTool(raw: Tool & { tech?: string }): Tool {
  return {
    ...raw,
    category: raw.category ?? raw.tech ?? 'web',
  }
}

function normalizeData(data: Partial<ToolsData>): ToolsData {
  return {
    categories: data.categories?.length ? data.categories : [...DEFAULT_CATEGORIES],
    tools: (data.tools ?? []).map((tool) => normalizeTool(tool as Tool & { tech?: string })),
  }
}

export function buildToolUrl(subdomain: string): string {
  if (!subdomain.trim()) {
    return `https://${BASE_DOMAIN}`
  }
  return `https://${subdomain.trim()}.${BASE_DOMAIN}`
}

export { getFaviconURL }

function readLocalOverride(): ToolsData | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('soratix-tools-override')
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ToolsData>
    return normalizeData(parsed)
  } catch {
    return null
  }
}

function persistData(): void {
  const payload: ToolsData = {
    categories: categories.value,
    tools: tools.value,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload, null, 2))
}

export function clearLocalOverride(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function loadHubData(force = false): Promise<ToolsData> {
  if (loaded.value && !force) {
    return { categories: categories.value, tools: tools.value }
  }

  loading.value = true

  try {
    const override = readLocalOverride()
    if (override) {
      categories.value = override.categories
      tools.value = override.tools
      loaded.value = true
      return override
    }

    const response = await fetch('/tools.json')
    if (!response.ok) {
      throw new Error('Impossible de charger tools.json')
    }

    const data = normalizeData((await response.json()) as Partial<ToolsData>)
    categories.value = data.categories
    tools.value = data.tools
    loaded.value = true
    return data
  } finally {
    loading.value = false
  }
}

export function resetHubCache(): void {
  loaded.value = false
}

export function getCategories(): Category[] {
  return [...categories.value]
}

export function getPublicTools(): Tool[] {
  return tools.value.filter((tool) => tool.public)
}

export function getAllTools(): Tool[] {
  return [...tools.value]
}

export function countToolsInCategory(categoryKey: string): number {
  return tools.value.filter((tool) => tool.category === categoryKey).length
}

export function createToolFromDraft(draft: ToolDraft): Tool {
  const subdomain = draft.subdomain.trim()
  const url = draft.url.trim() || buildToolUrl(subdomain)
  const iconDomain =
    draft.iconDomain.trim() || (subdomain ? `${subdomain}.${BASE_DOMAIN}` : BASE_DOMAIN)

  return {
    id: slugify(draft.name) || `tool-${Date.now()}`,
    name: draft.name.trim(),
    description: draft.description.trim(),
    subdomain,
    url,
    category: draft.category,
    technologies: draft.technologies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    status: draft.status,
    public: draft.public,
    iconDomain,
    repoUrl: draft.repoUrl.trim() || undefined,
  }
}

export function addTool(draft: ToolDraft): Tool {
  const tool = createToolFromDraft(draft)
  tools.value = [...tools.value, tool]
  persistData()
  return tool
}

export function updateTool(id: string, draft: ToolDraft): Tool | null {
  const index = tools.value.findIndex((tool) => tool.id === id)
  if (index === -1) return null

  const updated = { ...createToolFromDraft(draft), id }
  const next = [...tools.value]
  next[index] = updated
  tools.value = next
  persistData()
  return updated
}

export function removeTool(id: string): boolean {
  const next = tools.value.filter((tool) => tool.id !== id)
  if (next.length === tools.value.length) return false
  tools.value = next
  persistData()
  return true
}

export function createCategoryFromDraft(draft: CategoryDraft): Category {
  const key = slugify(draft.key || draft.label)
  return {
    key,
    label: draft.label.trim(),
    icon: draft.icon.trim() || 'web',
  }
}

export function addCategory(draft: CategoryDraft): Category | null {
  const category = createCategoryFromDraft(draft)
  if (!category.key || categories.value.some((item) => item.key === category.key)) {
    return null
  }
  categories.value = [...categories.value, category]
  persistData()
  return category
}

export function updateCategory(key: string, draft: CategoryDraft): Category | null {
  const index = categories.value.findIndex((category) => category.key === key)
  if (index === -1) return null

  const updated = {
    key,
    label: draft.label.trim(),
    icon: draft.icon.trim() || 'web',
  }
  const next = [...categories.value]
  next[index] = updated
  categories.value = next
  persistData()
  return updated
}

export function removeCategory(key: string): boolean {
  if (countToolsInCategory(key) > 0) return false
  const next = categories.value.filter((category) => category.key !== key)
  if (next.length === categories.value.length) return false
  categories.value = next
  persistData()
  return true
}

export function exportHubJson(): string {
  const payload: ToolsData = {
    categories: categories.value,
    tools: tools.value,
  }
  return JSON.stringify(payload, null, 2)
}

export function importHubJson(raw: string): boolean {
  try {
    const parsed = normalizeData(JSON.parse(raw) as Partial<ToolsData>)
    categories.value = parsed.categories
    tools.value = parsed.tools
    persistData()
    loaded.value = true
    return true
  } catch {
    return false
  }
}

// Backward-compatible aliases
export const loadTools = loadHubData
export const resetToolsCache = resetHubCache
export const exportToolsJson = exportHubJson
export const importToolsJson = importHubJson

export function useTools() {
  return {
    categories: readonly(categories),
    tools: readonly(tools),
    loaded: readonly(loaded),
    loading: readonly(loading),
    loadHubData,
    loadTools,
    resetHubCache,
    resetToolsCache,
    getCategories,
    getPublicTools,
    getAllTools,
    addTool,
    updateTool,
    removeTool,
    addCategory,
    updateCategory,
    removeCategory,
    countToolsInCategory,
    exportHubJson,
    importHubJson,
    exportToolsJson,
    importToolsJson,
    clearLocalOverride,
    buildToolUrl,
    getFaviconURL,
  }
}
