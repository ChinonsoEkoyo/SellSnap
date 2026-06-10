const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Database check successful, found', users.length, 'users');
  } catch (e) {
    console.error('Database connection error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
