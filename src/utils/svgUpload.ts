export function svgToDataUrl(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent.trim())
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
  return `data:image/svg+xml,${encoded}`
}

export async function readSvgFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
    throw new Error('Seuls les fichiers SVG sont acceptés.')
  }

  const content = await file.text()
  if (!content.includes('<svg')) {
    throw new Error('Le fichier ne semble pas être un SVG valide.')
  }

  if (content.length > 100_000) {
    throw new Error('Le SVG est trop volumineux (max 100 Ko).')
  }

  return svgToDataUrl(content)
}

export function isCustomIcon(icon: string): boolean {
  return icon.startsWith('data:image/svg+xml')
}
