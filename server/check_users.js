import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Total users:", users.length);
  for (const user of users) {
    if (user.email === 'staff01@rmu.ac.th' || user.email === 'admin@rmu.ac.th') {
      const isMatch = user.password ? await bcrypt.compare('admin123456', user.password) : false;
      console.log(`Email: ${user.email}, Role: ${user.role}, HasPassword: ${!!user.password}, Matches admin123456: ${isMatch}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
