import type { NextConfig } from 'next'

const isVercel = process.env.VERCEL === '1'

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: 'export', basePath: '/web_testng' }),
  images: { unoptimized: true },
}

export default nextConfig
