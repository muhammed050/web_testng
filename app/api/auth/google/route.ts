import { NextResponse } from 'next/server'
import { googleAuthUrl } from '../../../../lib/google-server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    return NextResponse.redirect(googleAuthUrl(url.searchParams.get('returnTo') || '/connect'))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Google OAuth is not configured' }, { status: 500 })
  }
}
