import { NextResponse } from 'next/server'
import { getGoogleClient, google } from '../../../../lib/google-server'

export const dynamic = 'force-dynamic'

type Body = { siteUrl: string; property: string; startDate: string; endDate: string }

export async function POST(request: Request) {
  try {
    const body = await request.json() as Body
    if (!body.siteUrl || !body.property || !body.startDate || !body.endDate) return NextResponse.json({ error: 'siteUrl, property, startDate and endDate are required' }, { status: 400 })
    const auth = await getGoogleClient()
    const sc = google.searchconsole({ version: 'v1', auth })
    const search = await sc.searchanalytics.query({
      siteUrl: body.siteUrl,
      requestBody: { startDate: body.startDate, endDate: body.endDate, dimensions: ['date'], rowLimit: 25000, dataState: 'final' },
    })
    const queryRows = await sc.searchanalytics.query({
      siteUrl: body.siteUrl,
      requestBody: { startDate: body.startDate, endDate: body.endDate, dimensions: ['query'], rowLimit: 1000, dataState: 'final' },
    })
    const pageRows = await sc.searchanalytics.query({
      siteUrl: body.siteUrl,
      requestBody: { startDate: body.startDate, endDate: body.endDate, dimensions: ['page'], rowLimit: 1000, dataState: 'final' },
    })
    const analytics = google.analyticsdata({ version: 'v1beta', auth })
    const property = body.property.startsWith('properties/') ? body.property : `properties/${body.property}`
    const ga = await analytics.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: body.startDate, endDate: body.endDate }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }, { name: 'eventCount' }],
        dimensions: [{ name: 'date' }],
        limit: '1000',
      },
    })
    const rows = search.data.rows || []
    const sum = (key: 'clicks'|'impressions') => rows.reduce((n, r) => n + Number(r[key] || 0), 0)
    const clicks = sum('clicks'), impressions = sum('impressions')
    const position = impressions ? rows.reduce((n,r)=>n+Number(r.position||0)*Number(r.impressions||0),0)/impressions : 0
    const gaRows = ga.data.rows || []
    const users = gaRows.reduce((n,r)=>n+Number(r.metricValues?.[0]?.value||0),0)
    const sessions = gaRows.reduce((n,r)=>n+Number(r.metricValues?.[1]?.value||0),0)
    const eventCount = gaRows.reduce((n,r)=>n+Number(r.metricValues?.[3]?.value||0),0)
    return NextResponse.json({
      searchConsole: { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position, trend: rows.map(r=>({ date:r.keys?.[0], clicks:r.clicks||0, impressions:r.impressions||0, ctr:r.ctr||0, position:r.position||0 })), queries: queryRows.data.rows || [], pages: pageRows.data.rows || [] },
      analytics: { users, sessions, eventCount, engagementRate: users ? gaRows.reduce((n,r)=>n+Number(r.metricValues?.[2]?.value||0),0)/gaRows.length : 0, trend: gaRows.map(r=>({date:r.dimensionValues?.[0]?.value, users:r.metricValues?.[0]?.value, sessions:r.metricValues?.[1]?.value})) },
      meta: { siteUrl: body.siteUrl, property, startDate: body.startDate, endDate: body.endDate, source: 'Google Search Console API + GA4 Data API' },
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Google analysis failed' }, { status: 500 })
  }
}
