import { ref, readonly } from 'vue'

export interface DiscordUser {
  id: string
  username: string
  global_name?: string
  avatar?: string
}

const isAuthenticated = ref(false)
const user = ref<DiscordUser | null>(null)
const authError = ref<string | null>(null)
const authLoading = ref(true)

function getApiBase(): string {
  return import.meta.env.VITE_DISCORD_API_BASE ?? '/api/discord'
}

function mapAuthError(code: string | null): string | null {
  if (!code) return null
  const messages: Record<string, string> = {
    unauthorized: 'Ce compte Discord n\'est pas autorisé à accéder au panel admin.',
    discord: 'La connexion Discord a échoué. Réessayez.',
    state: 'Session expirée. Relancez la connexion Discord.',
    config: 'L\'authentification Discord n\'est pas configurée sur le serveur.',
  }
  return messages[code] ?? 'Connexion impossible.'
}

export async function checkAuth(): Promise<boolean> {
  authLoading.value = true
  authError.value = null

  try {
    const response = await fetch(`${getApiBase()}/me.php`, {
      credentials: 'include',
    })

    if (!response.ok) {
      isAuthenticated.value = false
      user.value = null
      return false
    }

    const data = (await response.json()) as { authenticated: boolean; user?: DiscordUser }
    isAuthenticated.value = data.authenticated
    user.value = data.user ?? null
    return data.authenticated
  } catch {
    isAuthenticated.value = false
    user.value = null
    return false
  } finally {
    authLoading.value = false
  }
}

export function setAuthErrorFromQuery(code: string | null): void {
  authError.value = mapAuthError(code)
}

export function loginWithDiscord(): void {
  window.location.href = `${getApiBase()}/login.php`
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${getApiBase()}/logout.php`, {
      method: 'POST',
      credentials: 'include',
    })
  } finally {
    isAuthenticated.value = false
    user.value = null
  }
}

export function useAuth() {
  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    authError: readonly(authError),
    authLoading: readonly(authLoading),
    checkAuth,
    setAuthErrorFromQuery,
    loginWithDiscord,
    logout,
  }
}
