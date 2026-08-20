'use client'

import { useEffect, useState } from 'react'
import { googleLoginUrl, getGoogleSites, getGoogleProperties, type GoogleSite, type GoogleProperty, API_BASE_URL } from '../../lib/google-api'

export default function ConnectGoogle() {
  const [sites,setSites]=useState<GoogleSite[]>([])
  const [properties,setProperties]=useState<GoogleProperty[]>([])
  const [site,setSite]=useState('')
  const [property,setProperty]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [connected,setConnected]=useState(false)

  async function loadResources(){
    setLoading(true); setError('')
    try { const [s,p]=await Promise.all([getGoogleSites(),getGoogleProperties()]); setSites(s); setProperties(p); setConnected(true) }
    catch(e){ setError(e instanceof Error?e.message:'Could not load Google resources') }
    finally{setLoading(false)}
  }

  useEffect(()=>{ if(API_BASE_URL) loadResources() },[])

  return <main style={{minHeight:'100vh',background:'#f6f8fb',padding:'40px 20px',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:900,margin:'0 auto'}}>
      <div style={{background:'#fff',border:'1px solid #e5e9f0',borderRadius:18,padding:28}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start'}}>
          <div><div style={{fontSize:14,color:'#635bff',fontWeight:800}}>ELDEVO ANALYTICS</div><h1 style={{fontSize:32,margin:'8px 0'}}>Connect Google</h1><p style={{color:'#667085',margin:0}}>Connect once, then choose the Search Console website and GA4 property you want to analyze.</p></div>
          <div style={{fontSize:12,padding:'8px 11px',borderRadius:20,background:connected?'#eaf9f2':'#fff5df',color:connected?'#147d5c':'#956400'}}>{connected?'● Connected':'● Not connected'}</div>
        </div>
        <div style={{marginTop:26,padding:20,borderRadius:14,background:'#f7f7ff',border:'1px solid #e5e2ff'}}>
          {!API_BASE_URL ? <><b>Backend not configured</b><p style={{color:'#667085'}}>GitHub Pages is the frontend only. Set <code>NEXT_PUBLIC_API_BASE_URL</code> to your secure backend URL. Google Client Secret must stay on that backend.</p></> : <><b>Step 1 — Google account</b><p style={{color:'#667085'}}>Authorize Search Console and Google Analytics read-only access.</p><a href={googleLoginUrl('/connect')} style={{display:'inline-block',background:'#635bff',color:'#fff',padding:'12px 17px',borderRadius:10,textDecoration:'none',fontWeight:700}}>Continue with Google</a></>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:18}}>
          <label style={{display:'flex',flexDirection:'column',gap:8,fontSize:13,color:'#475467'}}><b>Step 2 — Search Console website</b><select value={site} onChange={e=>setSite(e.target.value)} disabled={!sites.length} style={{padding:12,border:'1px solid #d9dee8',borderRadius:9,background:'#fff'}}><option value="">{sites.length?'Choose a website':'Connect Google to load websites'}</option>{sites.map(s=><option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}</select></label>
          <label style={{display:'flex',flexDirection:'column',gap:8,fontSize:13,color:'#475467'}}><b>Step 3 — GA4 property</b><select value={property} onChange={e=>setProperty(e.target.value)} disabled={!properties.length} style={{padding:12,border:'1px solid #d9dee8',borderRadius:9,background:'#fff'}}><option value="">{properties.length?'Choose a property':'Connect Google to load properties'}</option>{properties.map(p=><option key={p.name} value={p.name}>{p.displayName} · {p.name}</option>)}</select></label>
        </div>
        {error&&<div style={{marginTop:16,padding:13,borderRadius:9,background:'#fff1f1',color:'#b42318'}}>{error}</div>}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:22,flexWrap:'wrap',gap:10}}>
          <span style={{fontSize:13,color:'#667085'}}>Selected: {site||'no website'} · {property||'no GA4 property'}</span>
          <button onClick={loadResources} disabled={loading||!API_BASE_URL} style={{padding:'11px 16px',borderRadius:9,border:'1px solid #d9dee8',background:'#fff',cursor:'pointer'}}>{loading?'Loading…':'Refresh Google resources'}</button>
        </div>
        <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid #edf0f4',fontSize:13,color:'#667085'}}><b>Security:</b> Client Secret is never entered here and must never be committed to GitHub Pages. The secure backend handles OAuth tokens and Google API calls.</div>
      </div>
    </div>
  </main>
}
