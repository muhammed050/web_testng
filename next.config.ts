import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // GitHub Pages needs the static export; Vercel must serve the app from root.
  output: 'export',
  images: { unoptimized: true },
}

export default nextConfig
