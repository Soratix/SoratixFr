import webIcon from '@/assets/icons/web.svg'
import androidIcon from '@/assets/icons/android.svg'
import type { Category } from '@/types/tool'

const BUILT_IN_ICONS: Record<string, string> = {
  web: webIcon,
  android: androidIcon,
}

export function resolveCategoryIcon(icon: string): string {
  if (icon.startsWith('data:') || icon.startsWith('/') || icon.startsWith('http')) {
    return icon
  }
  return BUILT_IN_ICONS[icon] ?? `/icons/${icon}.svg`
}

export const AVAILABLE_ICONS = [
  { key: 'web', label: 'Internet', preview: webIcon },
  { key: 'android', label: 'Android', preview: androidIcon },
] as const

export function getCategoryLabel(categories: Category[], key: string): string {
  return categories.find((category) => category.key === key)?.label ?? key
}
