export type ToolStatus = 'live' | 'dev' | 'planned'

export interface Category {
  key: string
  label: string
  icon: string
}

export interface Tool {
  id: string
  name: string
  description: string
  subdomain: string
  url: string
  category: string
  technologies: string[]
  status: ToolStatus
  public: boolean
  iconDomain: string
  repoUrl?: string
}

export interface ToolsData {
  categories: Category[]
  tools: Tool[]
}

export interface ToolDraft {
  name: string
  description: string
  subdomain: string
  url: string
  category: string
  technologies: string
  status: ToolStatus
  public: boolean
  iconDomain: string
  repoUrl: string
}

export interface CategoryDraft {
  key: string
  label: string
  icon: string
}
