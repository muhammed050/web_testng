import { NextRequest,NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getGoogleOAuth } from '@/lib/google'

export async function GET(req:NextRequest){
 const token=req.cookies.get('google_access_token')?.value
 if(!token) return NextResponse.json({error:'Not connected to Google'},{status:401})
 try{const auth=getGoogleOAuth();auth.setCredentials({access_token:token});const api=google.searchconsole({version:'v1',auth});const data=await api.sites.list();return NextResponse.json({sites:data.data.siteEntry||[]})}
 catch(e){return NextResponse.json({error:'Unable to load Search Console properties'},{status:500})}
}