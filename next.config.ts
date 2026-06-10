import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/adapter-better-sqlite3', '@prisma/driver-adapter-utils'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
