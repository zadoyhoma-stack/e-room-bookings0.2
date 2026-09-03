const { PrismaClient } = require('@prisma/client');

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
  for (const r of regions) {
    const url = `postgresql://postgres.hryzudawgrgrotgzvnlm:Teera_110aa@${r}.pooler.supabase.com:6543/postgres?sslmode=require`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('SUCCESS REGION:', r);
      await prisma.$disconnect();
      return;
    } catch (e) {
      console.log('FAILED REGION:', r, e.message);
      await prisma.$disconnect();
    }
  }
}

test();
