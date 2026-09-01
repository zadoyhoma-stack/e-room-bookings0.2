import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rooms = await prisma.room.findMany({ select: { id: true, name: true, image: true } });
  console.log(rooms);
}
main().catch(console.error).finally(() => prisma.$disconnect());
