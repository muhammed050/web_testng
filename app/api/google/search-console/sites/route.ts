import { NextResponse } from 'next/server'
import { getGoogleClient, google } from '../../../../../lib/google-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await getGoogleClient()
    const sc = google.searchconsole({ version: 'v1', auth })
    const { data } = await sc.sites.list()
    return NextResponse.json((data.siteEntry || []).map(s => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel })))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load Search Console sites' }, { status: 401 })
  }
}
