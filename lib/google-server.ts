import { google } from 'googleapis'
import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/analytics.admin.readonly',
]

function oauth() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Google OAuth environment variables are not configured on Vercel.')
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function googleAuthUrl(returnTo = '/connect') {
  const client = oauth()
  const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64url')
  return client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES, state, include_granted_scopes: true })
}

export async function exchangeCode(code: string) {
  const client = oauth()
  const { tokens } = await client.getToken(code)
  return tokens
}

const COOKIE = 'google_tokens'
function key() {
  const secret = process.env.GOOGLE_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET
  if (!secret) throw new Error('GOOGLE_SESSION_SECRET is missing.')
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptTokens(tokens: unknown) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const data = Buffer.concat([cipher.update(JSON.stringify(tokens), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${data.toString('base64url')}`
}

export function decryptTokens(value: string) {
  const [ivRaw, tagRaw, dataRaw] = value.split('.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(dataRaw, 'base64url')), decipher.final()]).toString('utf8'))
}

export async function getGoogleClient() {
  const jar = await cookies()
  const value = jar.get(COOKIE)?.value
  if (!value) throw new Error('Google account is not connected.')
  const tokens = decryptTokens(value)
  const client = oauth()
  client.setCredentials(tokens)
  return client
}

export function googleCookie(value: string) {
  return { name: COOKIE, value, httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 30 }
}

export function clearGoogleCookie() {
  return { name: COOKIE, value: '', httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 0 }
}

export { google }
