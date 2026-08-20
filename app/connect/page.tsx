'use client'

import { useEffect, useState } from 'react'
import { googleLoginUrl, getGoogleSites, getGoogleProperties, type GoogleSite, type GoogleProperty } from '../../lib/google-api'

export default function ConnectGoogle() {
  const [ar,setAr]=useState(false)
  const [sites,setSites]=useState<GoogleSite[]>([])
  const [properties,setProperties]=useState<GoogleProperty[]>([])
  const [site,setSite]=useState('')
  const [property,setProperty]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [connected,setConnected]=useState(false)

  useEffect(()=>{
    const arabic=navigator.language.toLowerCase().startsWith('ar')
    setAr(arabic)
    void loadGoogle()
  },[])

  async function loadGoogle(){
    setLoading(true); setError('')
    try {
      const [s,p]=await Promise.all([getGoogleSites(),getGoogleProperties()])
      setSites(s); setProperties(p); setConnected(true)
      const saved=JSON.parse(localStorage.getItem('googleSelection')||'null')
      if(saved?.site && s.some(x=>x.siteUrl===saved.site)) setSite(saved.site)
      if(saved?.property && p.some(x=>x.name===saved.property)) setProperty(saved.property)
    } catch(e) {
      setConnected(false)
      setError(e instanceof Error ? e.message : (ar?'تعذر جلب بيانات Google':'Unable to load Google data'))
    } finally { setLoading(false) }
  }

  function analyze(){
    if(!site||!property){setError(ar?'اختر الموقع وخصائص GA4 أولاً':'Choose a website and GA4 property first');return}
    localStorage.setItem('googleSelection',JSON.stringify({site,property}))
    location.href='/dashboard'
  }

  const t=ar?{brand:'إلديفو تحليلات',title:'ربط Google',desc:'سجّل الدخول بحساب Google ثم اختر الموقع الذي تريد تحليله وخصائص GA4.',connect:'تسجيل الدخول باستخدام Google',site:'موقع Search Console',prop:'خاصية GA4',choose:'اختر',refresh:'تحديث البيانات',analyze:'بدء التحليل',not:'غير متصل',connected:'Google متصل — بيانات حقيقية',security:'الأمان: لا يتم إدخال Client Secret هنا. يتم حفظه واستخدامه على خادم Vercel فقط.'}:{brand:'ELDEVO ANALYTICS',title:'Connect Google',desc:'Sign in with Google, then choose the website and GA4 property to analyze.',connect:'Sign in with Google',site:'Search Console website',prop:'GA4 property',choose:'Choose',refresh:'Refresh Google data',analyze:'Start analysis',not:'Not connected',connected:'Google connected — live data',security:'Security: Client Secret is never entered here. It stays on the Vercel server.'}

  return <main dir={ar?'rtl':'ltr'} style={{minHeight:'100vh',background:'#f6f8fb',padding:'40px 20px',fontFamily:'Inter,system-ui,sans-serif'}}><div style={{maxWidth:940,margin:'0 auto'}}>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><button onClick={()=>setAr(!ar)} style={{border:'1px solid #d9dee8',background:'#fff',borderRadius:9,padding:'8px 12px',cursor:'pointer'}}>{ar?'English':'العربية'}</button></div>
    <div style={{background:'#fff',border:'1px solid #e5e9f0',borderRadius:18,padding:28}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start'}}><div><div style={{fontSize:14,color:'#635bff',fontWeight:800}}>{t.brand}</div><h1 style={{fontSize:32,margin:'8px 0'}}>{t.title}</h1><p style={{color:'#667085',margin:0}}>{t.desc}</p></div><div style={{fontSize:12,padding:'8px 11px',borderRadius:20,background:connected?'#eaf9f2':'#fff5df',color:connected?'#147d5c':'#956400'}}>● {connected?t.connected:t.not}</div></div>
      <div style={{marginTop:26,padding:20,borderRadius:14,background:'#f7f7ff',border:'1px solid #e5e2ff'}}><b>1</b><p style={{color:'#667085'}}>{ar?'امنح صلاحية القراءة فقط لـ Search Console وGA4. بعد العودة من Google سيتم جلب المواقع والخصائص تلقائيًا.':'Authorize read-only access to Search Console and GA4. After returning from Google, sites and properties are loaded automatically.'}</p><a href={googleLoginUrl('/connect')} style={{display:'inline-block',background:'#635bff',color:'#fff',padding:'12px 17px',borderRadius:10,textDecoration:'none',fontWeight:700}}>{t.connect}</a></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:18}}><label style={{display:'flex',flexDirection:'column',gap:8,fontSize:13,color:'#475467'}}><b>2 — {t.site}</b><select value={site} onChange={e=>setSite(e.target.value)} disabled={!sites.length} style={{padding:12,border:'1px solid #d9dee8',borderRadius:9,background:'#fff'}}><option value="">{t.choose}</option>{sites.map(s=><option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}</select></label><label style={{display:'flex',flexDirection:'column',gap:8,fontSize:13,color:'#475467'}}><b>3 — {t.prop}</b><select value={property} onChange={e=>setProperty(e.target.value)} disabled={!properties.length} style={{padding:12,border:'1px solid #d9dee8',borderRadius:9,background:'#fff'}}><option value="">{t.choose}</option>{properties.map(p=><option key={p.name} value={p.name}>{p.displayName} · {p.name}</option>)}</select></label></div>
      {error&&<div style={{marginTop:16,padding:13,borderRadius:9,background:'#fff1f1',color:'#b42318'}}>{error}</div>}
      {loading&&<div style={{marginTop:16,padding:13,borderRadius:9,background:'#eef3ff',color:'#44527b'}}>{ar?'جاري جلب المواقع وخصائص GA4 من Google…':'Loading your Search Console sites and GA4 properties from Google…'}</div>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:22,flexWrap:'wrap',gap:10}}><span style={{fontSize:13,color:'#667085'}}>{site||t.choose} · {property||t.choose}</span><div style={{display:'flex',gap:10}}><button onClick={loadGoogle} disabled={loading} style={{padding:'11px 16px',borderRadius:9,border:'1px solid #d9dee8',background:'#fff',cursor:'pointer'}}>{loading?'…':t.refresh}</button><button onClick={analyze} disabled={!site||!property} style={{padding:'11px 16px',borderRadius:9,border:0,background:'#635bff',color:'#fff',cursor:'pointer',fontWeight:700,opacity:site&&property?1:.5}}>{t.analyze}</button></div></div>
      <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid #edf0f4',fontSize:13,color:'#667085'}}>{t.security}</div>
    </div></div></main>
}
