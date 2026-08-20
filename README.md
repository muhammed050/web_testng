# Eldevo Analytics Intelligence

A Next.js dashboard that turns Google Search Console and Google Analytics data into an SEO/traffic intelligence report.

## Included
- Google OAuth foundation with Search Console + Analytics scopes
- Search Console property discovery
- Search Analytics API query endpoint
- Executive dashboard with KPI cards, trends, landing pages, keyword opportunities and AI-style insights
- Custom reporting periods in the UI
- Responsive desktop/mobile interface
- Architecture ready for GA4 Data API, Supabase persistence, AI analysis and PDF/XLSX report generation

## Run
```bash 
npm install
cp .env.example .env.local
npm run dev
```

Configure a Google Cloud OAuth Web application and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`.

For production, store OAuth refresh tokens encrypted server-side and use a database/session layer rather than exposing tokens to the client.
