import { NextResponse } from 'next/server'
import { getGoogleClient, google } from '../../../../lib/google-server'

export const dynamic = 'force-dynamic'
type Body = { siteUrl: string; property: string; startDate: string; endDate: string }
type SearchRow = Record<string, unknown>
type GARow = { dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }

async function q(sc: any, siteUrl: string, startDate: string, endDate: string, dimensions: string[], rowLimit = 1000): Promise<SearchRow[]> {
  const r = await sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate, dimensions, rowLimit, dataState: 'final' } })
  return (r.data.rows || []) as SearchRow[]
}

export async function POST(request: Request) {
  try {
    const b = await request.json() as Body
    if (!b.siteUrl || !b.property || !b.startDate || !b.endDate) return NextResponse.json({ error: 'siteUrl, property, startDate and endDate are required' }, { status: 400 })
    const auth = await getGoogleClient()
    const sc = google.searchconsole({ version: 'v1', auth })
    const [trend, queries, pages, countries, devices] = await Promise.all([
      q(sc, b.siteUrl, b.startDate, b.endDate, ['date'], 25000),
      q(sc, b.siteUrl, b.startDate, b.endDate, ['query']),
      q(sc, b.siteUrl, b.startDate, b.endDate, ['page']),
      q(sc, b.siteUrl, b.startDate, b.endDate, ['country']),
      q(sc, b.siteUrl, b.startDate, b.endDate, ['device'])
    ])
    const analytics = google.analyticsdata({ version: 'v1beta', auth })
    const property = b.property.startsWith('properties/') ? b.property : `properties/${b.property}`
    const [gaTrend, gaCountries, gaDevices] = await Promise.all([
      analytics.properties.runReport({ property, requestBody: { dateRanges: [{ startDate: b.startDate, endDate: b.endDate }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'engagementRate' }, { name: 'eventCount' }], dimensions: [{ name: 'date' }], limit: '1000' } }),
      analytics.properties.runReport({ property, requestBody: { dateRanges: [{ startDate: b.startDate, endDate: b.endDate }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }], dimensions: [{ name: 'country' }], limit: '250' } }),
      analytics.properties.runReport({ property, requestBody: { dateRanges: [{ startDate: b.startDate, endDate: b.endDate }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }], dimensions: [{ name: 'deviceCategory' }], limit: '20' } })
    ])
    const sum = (rs: SearchRow[], k: string): number => rs.reduce((n: number, r: SearchRow) => n + Number(r[k] || 0), 0)
    const clicks = sum(trend, 'clicks')
    const impressions = sum(trend, 'impressions')
    const position = impressions ? trend.reduce((n: number, r: SearchRow) => n + Number(r.position || 0) * Number(r.impressions || 0), 0) / impressions : 0
    const gr = (gaTrend.data.rows || []) as GARow[]
    const users = gr.reduce((n: number, r: GARow) => n + Number(r.metricValues?.[0]?.value || 0), 0)
    const sessions = gr.reduce((n: number, r: GARow) => n + Number(r.metricValues?.[1]?.value || 0), 0)
    const eventCount = gr.reduce((n: number, r: GARow) => n + Number(r.metricValues?.[3]?.value || 0), 0)
    const engagementRate = gr.length ? gr.reduce((n: number, r: GARow) => n + Number(r.metricValues?.[2]?.value || 0), 0) / gr.length : 0
    return NextResponse.json({ searchConsole: { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position, trend, queries, pages, countries, devices }, analytics: { users, sessions, eventCount, engagementRate, trend: gr.map((r: GARow) => ({ date: r.dimensionValues?.[0]?.value, users: r.metricValues?.[0]?.value, sessions: r.metricValues?.[1]?.value })), countries: gaCountries.data.rows || [], devices: gaDevices.data.rows || [] }, meta: { siteUrl: b.siteUrl, property, startDate: b.startDate, endDate: b.endDate, source: 'Google Search Console API + GA4 Data API' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Google analysis failed' }, { status: 500 })
  }
}
