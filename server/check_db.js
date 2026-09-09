import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        department: true,
        password: true,
      }
    });
    console.log('=== REAL POSTGRESQL DATABASE USERS ===');
    console.log('Total Users found:', users.length);
    console.dir(users, { depth: null });
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
