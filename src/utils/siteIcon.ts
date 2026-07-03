const SIZE = 128

function cleanDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim()
}

/** Ordered fallbacks from sharpest / largest sources first */
export function getSiteIconUrls(domain: string): string[] {
  const host = cleanDomain(domain)
  if (!host) return []

  return [
    `https://www.google.com/s2/favicons?domain=${host}&sz=${SIZE}`,
    `https://icons.duckduckgo.com/ip3/${host}.ico`,
    `https://${host}/apple-touch-icon.png`,
    `https://${host}/favicon.ico`,
  ]
}

export function getFaviconURL(domain: string): string {
  return getSiteIconUrls(domain)[0] ?? ''
}
