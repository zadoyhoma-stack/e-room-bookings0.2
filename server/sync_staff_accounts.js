import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  const staffPass = 'staff1234';
  const hashedPassword = await bcrypt.hash(staffPass, 10);

  const staffAccounts = [
    {
      email: 'nikkystaff@gmail.com',
      username: 'nikkystaff',
      name: 'น้องนิกกี้ (เจ้าหน้าที่)',
      nickname: 'นิกกี้',
      role: 'staff',
      department: 'สำนักวิทยบริการฯ'
    },
    {
      email: 'staff01@rmu.ac.th',
      username: 'staff01',
      name: 'สมใจ รักงาน (เจ้าหน้าที่)',
      nickname: 'ใจ',
      role: 'staff',
      department: 'สำนักวิทยบริการฯ'
    },
    {
      email: 'staff@rmu.ac.th',
      username: 'staff',
      name: 'เจ้าหน้าที่ระบบ',
      nickname: 'เจ้าหน้าที่',
      role: 'staff',
      department: 'สำนักวิทยบริการฯ'
    }
  ];

  console.log('🔑 Upserting Staff accounts into Prisma Supabase DB...');
  for (const acc of staffAccounts) {
    try {
      await prisma.user.upsert({
        where: { email: acc.email },
        update: {
          password: hashedPassword,
          role: 'staff',
          username: acc.username,
          name: acc.name
        },
        create: {
          email: acc.email,
          username: acc.username,
          password: hashedPassword,
          name: acc.name,
          nickname: acc.nickname,
          role: 'staff',
          department: acc.department
        }
      });
      console.log(`✅ [Prisma DB] Staff account synced: ${acc.email} / username: ${acc.username}`);
    } catch (e) {
      console.warn(`⚠️ Prisma error for ${acc.email}:`, e.message);
    }
  }

  // Also sync database.json
  const dbPath = path.join(__dirname, 'database.json');
  if (fs.existsSync(dbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (!data.users) data.users = [];

      for (const acc of staffAccounts) {
        const idx = data.users.findIndex(u => u.email === acc.email || u.username === acc.username);
        const obj = {
          id: idx >= 0 ? data.users[idx].id : `u_staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: acc.name,
          email: acc.email,
          username: acc.username,
          role: 'staff',
          department: acc.department,
          password: hashedPassword,
          plainPassword: staffPass
        };
        if (idx >= 0) {
          data.users[idx] = { ...data.users[idx], ...obj };
        } else {
          data.users.push(obj);
        }
      }

      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('✅ [database.json] Staff accounts synced.');
    } catch (dbErr) {
      console.error('Failed to sync database.json:', dbErr);
    }
  }
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(() => prisma.$disconnect());
