export type GoogleSite = { siteUrl: string; permissionLevel?: string }
export type GoogleProperty = { name: string; displayName: string; propertyType?: string }

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
const api = (path: string) => `${API_BASE_URL}${path}`

export function googleLoginUrl(returnTo = '/connect') {
  return `${api('/api/auth/google')}?returnTo=${encodeURIComponent(returnTo)}`
}

export async function getGoogleSites(): Promise<GoogleSite[]> {
  const res = await fetch(api('/api/google/search-console/sites'), { credentials: 'include' })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Unable to load Search Console sites')
  return res.json()
}

export async function getGoogleProperties(): Promise<GoogleProperty[]> {
  const res = await fetch(api('/api/google/analytics/properties'), { credentials: 'include' })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Unable to load GA4 properties')
  return res.json()
}
