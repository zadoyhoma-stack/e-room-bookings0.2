import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testPasswords = [
  'admin1234',
  'admin123456',
  'staff1234',
  '123456',
  '12345678',
  'rmu123456',
  'password',
  '1234'
];

async function verify() {
  const users = await prisma.user.findMany();
  console.log('=== VERIFYING POSTGRESQL USER PASSWORDS ===\n');

  for (const user of users) {
    console.log(`User: ${user.name} (${user.email} / username: ${user.username} / role: ${user.role})`);
    if (!user.password) {
      console.log('  -> Password: NULL (SSO/Google or initial login)\n');
      continue;
    }

    let foundPass = null;
    for (const pass of testPasswords) {
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        const match = await bcrypt.compare(pass, user.password);
        if (match) {
          foundPass = pass;
          break;
        }
      } else if (user.password === pass) {
        foundPass = pass;
        break;
      }
    }

    if (foundPass) {
      console.log(`  -> Matched Password: "${foundPass}"\n`);
    } else {
      console.log(`  -> Hash: ${user.password}\n`);
    }
  }

  await prisma.$disconnect();
}

verify();
