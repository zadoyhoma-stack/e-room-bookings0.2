import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const usersToUpdate = [
    { email: 'admin@rmu.ac.th', pass: 'admin1234', role: 'admin', name: 'ผู้ดูแลระบบ' },
    { email: 'nikkystaff@gmail.com', pass: 'staff1234', role: 'staff', name: 'น้องนิกกี้' },
    { email: 'nikky@gmail.com', pass: 'std1234', role: 'student', name: 'nikky' },
    { email: 'student02@rmu.ac.th', pass: 'std1234', role: 'student', name: 'นักศึกษา 02' },
    { email: '663170010124@rmu.ac.th', pass: 'rmuG1468700020979', role: 'student', name: 'ธีรพงศ์' }
  ];

  for (const u of usersToUpdate) {
    const hashed = await bcrypt.hash(u.pass, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed, name: u.name },
      create: {
        id: 'u_' + Date.now() + Math.floor(Math.random() * 1000),
        email: u.email,
        name: u.name,
        role: u.role,
        password: hashed
      }
    });
    console.log(`Updated user: ${u.email}`);
  }

  console.log('All passwords successfully set on Supabase DB!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
