import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google'

export async function GET(){
  if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return NextResponse.json({error:'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'},{status:503})
  return NextResponse.redirect(getAuthUrl())
}