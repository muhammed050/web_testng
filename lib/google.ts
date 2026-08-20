import { google } from 'googleapis'

export function getGoogleOAuth(){
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI)
}

export const GOOGLE_SCOPES=[
  'openid','email','profile',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly'
]

export function getAuthUrl(){
  return getGoogleOAuth().generateAuthUrl({access_type:'offline',prompt:'consent',scope:GOOGLE_SCOPES})
}
