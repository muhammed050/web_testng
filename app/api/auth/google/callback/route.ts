import { NextRequest, NextResponse } from 'next/server'
import { getGoogleOAuth } from '@/lib/google'

export async function GET(req:NextRequest){
  const code=req.nextUrl.searchParams.get('code')
  if(!code) return NextResponse.redirect(new URL('/?error=google_oauth_failed',req.url))
  try{
    const client=getGoogleOAuth(); const {tokens}=await client.getToken(code)
    const response=NextResponse.redirect(new URL('/?connected=google',req.url))
    response.cookies.set('google_access_token',tokens.access_token || '',{httpOnly:true,secure:true,sameSite:'lax',maxAge:3600,path:'/'})
    if(tokens.refresh_token) response.cookies.set('google_refresh_token',tokens.refresh_token,{httpOnly:true,secure:true,sameSite:'lax',maxAge:60*60*24*30*6,path:'/'})
    return response
  }catch{return NextResponse.redirect(new URL('/?error=google_token_exchange_failed',req.url))}
}