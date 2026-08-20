import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Eldevo Analytics Intelligence', description: 'Google Search Console and Analytics intelligence dashboard' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}