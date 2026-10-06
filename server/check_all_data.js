import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAll() {
  try {
    const users = await prisma.user.findMany();
    const rooms = await prisma.room.findMany();
    const bookings = await prisma.booking.findMany();
    
    console.log('--- 👤 Users ---');
    console.log(`Total: ${users.length}`);
    users.forEach(u => console.log(`- [${u.role}] ${u.name} (${u.email})`));

    console.log('\n--- 🚪 Rooms ---');
    console.log(`Total: ${rooms.length}`);
    rooms.forEach(r => console.log(`- ${r.name} (Capacity: ${r.capacity})`));

    console.log('\n--- 📅 Bookings ---');
    console.log(`Total: ${bookings.length}`);
    bookings.forEach(b => console.log(`- ${b.topic} | Room: ${b.roomId} | User: ${b.userId} | Status: ${b.status} | Date: ${b.date}`));

  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAll();
