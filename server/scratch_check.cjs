const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    orderBy: { date: 'desc' },
    include: { room: true, user: true }
  });
  console.log('Total bookings in Neon DB:', bookings.length);
  const pending = bookings.filter(b => b.status === 'pending');
  console.log('Pending bookings count:', pending.length);
  pending.forEach(b => {
    console.log('Pending Booking:', {
      id: b.id,
      roomId: b.roomId,
      roomName: b.room ? b.room.name : 'NO ROOM FOUND!',
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      userName: b.userName,
      user: b.user ? b.user.name : 'NO USER FOUND!',
      status: b.status
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
