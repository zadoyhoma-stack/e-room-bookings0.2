import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const staffPassword = await bcrypt.hash('staff1234', 10);

  // Admin
  await prisma.user.update({
    where: { email: 'admin@rmu.ac.th' },
    data: { password: adminPassword }
  });

  // Staff
  await prisma.user.update({
    where: { email: 'staff01@rmu.ac.th' },
    data: { password: staffPassword }
  });

  console.log('Updated passwords to admin1234 and staff1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
