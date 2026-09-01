import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('rmuG1468700020979', 10);
  const email = '663170010124@rmu.ac.th';

  await prisma.user.upsert({
    where: { email: email },
    update: { 
      password: password, 
      role: 'student', 
      username: '663170010124',
      name: 'นักศึกษา ทดสอบ'
    },
    create: {
      email: email,
      username: '663170010124',
      password: password,
      name: 'นักศึกษา ทดสอบ',
      nickname: 'เทส',
      role: 'student',
      department: 'คณะเทคโนโลยีสารสนเทศ'
    }
  });

  console.log(`Successfully added/updated test user: ${email} with password rmuG1468700020979`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
