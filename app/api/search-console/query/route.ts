import { NextRequest,NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getGoogleOAuth } from '@/lib/google'

export async function POST(req:NextRequest){
 const token=req.cookies.get('google_access_token')?.value;if(!token)return NextResponse.json({error:'Not connected'},{status:401})
 try{const {siteUrl,startDate,endDate,dimensions=['date'],rowLimit=25000}=await req.json();if(!siteUrl||!startDate||!endDate)return NextResponse.json({error:'siteUrl, startDate and endDate are required'},{status:400});const auth=getGoogleOAuth();auth.setCredentials({access_token:token});const api=google.searchconsole({version:'v1',auth});const result=await api.searchanalytics.query({siteUrl,requestBody:{startDate,endDate,dimensions,rowLimit,dataState:'final'}});return NextResponse.json({rows:result.data.rows||[]})}
 catch(e){return NextResponse.json({error:'Search Console query failed'},{status:500})}
}