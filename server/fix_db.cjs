const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.user.updateMany({
    where: { email: '663170010124@rmu.ac.th' },
    data: { name: 'ธีรพงศ์ ชื่นชู', studentId: '663170010124' }
  });
  await prisma.user.updateMany({
    where: { email: 'staff01@rmu.ac.th' },
    data: { name: 'สมใจ รักงาน' }
  });
  console.log('Updated in DB');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
