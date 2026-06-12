import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const url = (process.env.DATABASE_URL || 'file:./dev.db').replace(/^file:/, '');
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
