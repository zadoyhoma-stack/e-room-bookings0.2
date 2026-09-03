const { PrismaClient } = require('@prisma/client');

const passwords = [
  'Teera_110aa',
  'teera_110aa',
  'Teera110aa',
  'teera110aa',
  'Teera_110AA'
];

const usernames = [
  'postgres.hryzudawgrgrotgzvnlm',
  'postgres'
];

const ports = [6543, 5432];

async function test() {
  const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
  for (const p of passwords) {
    for (const u of usernames) {
      for (const port of ports) {
        const url = `postgresql://${u}:${encodeURIComponent(p)}@${host}:${port}/postgres?sslmode=require`;
        const prisma = new PrismaClient({ datasources: { db: { url } } });
        try {
          await prisma.$queryRaw`SELECT 1`;
          console.log('SUCCESSFUL COMBINATION! User:', u, 'Password:', p, 'Port:', port);
          await prisma.$disconnect();
          return;
        } catch (e) {
          if (!e.message.includes('tenant') && !e.message.includes('Can\'t reach')) {
            console.log('Tested:', u, p, port, '=>', e.message.split('\n')[0]);
          }
          await prisma.$disconnect();
        }
      }
    }
  }
}

test();
