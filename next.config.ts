import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/web_testng',
  images: { unoptimized: true },
}

export default nextConfig
