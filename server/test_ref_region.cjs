const { PrismaClient } = require('@prisma/client');

const refs = ['cwkrdcmdjyxrxdtspiiw', 'cwkrdcrndjyxrxdtspiiw'];
const regions = [
  'aws-0-ap-southeast-1',
  'aws-0-us-east-1',
  'aws-0-us-west-1',
  'aws-0-eu-central-1',
  'aws-0-ap-northeast-1',
  'aws-0-ap-south-1',
  'aws-0-sa-east-1',
  'aws-0-eu-west-1',
  'aws-0-ca-central-1'
];

async function test() {
  for (const ref of refs) {
    for (const r of regions) {
      const url = `postgresql://postgres.${ref}:Teera_110aa@${r}.pooler.supabase.com:5432/postgres`;
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('SUCCESS REF & REGION:', ref, r);
        await prisma.$disconnect();
        return;
      } catch (e) {
        if (!e.message.includes('not found') && !e.message.includes('Can\'t reach')) {
          console.log('FOUND REF & REGION:', ref, r, '=>', e.message.split('\n')[0]);
        }
        await prisma.$disconnect();
      }
    }
  }
}

test();
