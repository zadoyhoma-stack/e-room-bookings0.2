import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123456', 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@rmu.ac.th' },
    update: { password, role: 'admin', username: 'admin' },
    create: {
      email: 'admin@rmu.ac.th',
      username: 'admin',
      password,
      name: 'ผู้ดูแลระบบ',
      nickname: 'แอดมิน',
      role: 'admin',
      department: 'สำนักวิทยบริการฯ'
    }
  });

  // Staff
  await prisma.user.upsert({
    where: { email: 'staff01@rmu.ac.th' },
    update: { password, role: 'staff', username: 'staff01' },
    create: {
      email: 'staff01@rmu.ac.th',
      username: 'staff01',
      password,
      name: 'สมใจ รักงาน',
      nickname: 'ใจ',
      role: 'staff',
      department: 'สำนักวิทยบริการฯ'
    }
  });

  // Student
  await prisma.user.upsert({
    where: { email: 'student01@rmu.ac.th' },
    update: { password, role: 'student', username: 'student01' },
    create: {
      email: 'student01@rmu.ac.th',
      username: 'student01',
      password,
      name: 'สมชาย เรียนดี',
      nickname: 'ชาย',
      role: 'student',
      department: 'คณะเทคโนโลยีสารสนเทศ'
    }
  });

  console.log('Seeded admin, staff, and student with password admin123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
