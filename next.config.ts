import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Serverless (Vercel) muhitda mongoose connection pooling uchun
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
