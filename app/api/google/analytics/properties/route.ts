import { NextResponse } from 'next/server'
import { getGoogleClient, google } from '../../../../../lib/google-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await getGoogleClient()
    const admin = google.analyticsadmin({ version: 'v1beta', auth })
    const { data } = await admin.accountSummaries.list({ pageSize: 200 })
    const properties = (data.accountSummaries || []).flatMap(a => (a.propertySummaries || []).map(p => ({ name: p.property || '', displayName: p.displayName || '', propertyType: p.propertyType || '' })))
    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load GA4 properties' }, { status: 401 })
  }
}
