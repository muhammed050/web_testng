import { NextResponse } from 'next/server'
import { exchangeCode, encryptTokens, googleCookie } from '../../../../../lib/google-server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code) return NextResponse.json({ error: 'Missing Google authorization code' }, { status: 400 })
  try {
    const tokens = await exchangeCode(code)
    let returnTo = '/connect'
    if (state) {
      try { returnTo = JSON.parse(Buffer.from(state, 'base64url').toString()).returnTo || returnTo } catch {}
    }
    if (!returnTo.startsWith('/')) returnTo = '/connect'
    const response = NextResponse.redirect(new URL(returnTo, url.origin))
    response.cookies.set(googleCookie(encryptTokens(tokens)))
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Google OAuth callback failed' }, { status: 500 })
  }
}
