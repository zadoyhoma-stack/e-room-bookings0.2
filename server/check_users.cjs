const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testUsers() {
  console.log('=== Checking Users in Neon DB ===');
  try {
    const users = await prisma.user.findMany();
    console.log('Total users in Neon DB:', users.length);
    for (const u of users) {
      console.log(`- ID: ${u.id} | Username: "${u.username}" | Email: "${u.email}" | Role: "${u.role}" | Name: "${u.name}" | Pwd: "${u.password}"`);
    }

    console.log('\n=== Testing Login for admin@rmu.ac.th ===');
    const adminUser = users.find(u => u.username === 'admin@rmu.ac.th' || u.email === 'admin@rmu.ac.th');
    if (adminUser) {
      const isMatch = await bcrypt.compare('admin1234', adminUser.password);
      console.log('Admin admin1234 match:', isMatch);
    } else {
      console.log('admin@rmu.ac.th NOT FOUND in Neon DB!');
    }

    console.log('\n=== Testing Login for nikkystaff@gmail.com ===');
    const staffUser = users.find(u => u.username === 'nikkystaff@gmail.com' || u.email === 'nikkystaff@gmail.com');
    if (staffUser) {
      const isMatch = await bcrypt.compare('staff1234', staffUser.password);
      console.log('Staff staff1234 match:', isMatch);
    } else {
      console.log('nikkystaff@gmail.com NOT FOUND in Neon DB!');
    }

  } catch (err) {
    console.error('Neon DB Error:', err);
  }
}

testUsers().finally(() => prisma.$disconnect());
