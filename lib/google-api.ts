export type GoogleSite = { siteUrl: string; permissionLevel?: string }
export type GoogleProperty = { name: string; displayName: string; propertyType?: string }

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

export function googleLoginUrl(returnTo = '/dashboard') {
  if (!API_BASE_URL) return ''
  return `${API_BASE_URL}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`
}

export async function getGoogleSites(): Promise<GoogleSite[]> {
  if (!API_BASE_URL) return []
  const res = await fetch(`${API_BASE_URL}/api/google/search-console/sites`, { credentials: 'include' })
  if (!res.ok) throw new Error('Unable to load Search Console sites')
  return res.json()
}

export async function getGoogleProperties(): Promise<GoogleProperty[]> {
  if (!API_BASE_URL) return []
  const res = await fetch(`${API_BASE_URL}/api/google/analytics/properties`, { credentials: 'include' })
  if (!res.ok) throw new Error('Unable to load GA4 properties')
  return res.json()
}
