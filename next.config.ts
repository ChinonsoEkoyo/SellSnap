import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/adapter-better-sqlite3', '@prisma/adapter-pg', '@prisma/driver-adapter-utils', 'pg', 'better-sqlite3'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
