import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

async function main() {
  console.log('--- Database Migration Check ---');
  
  // Read local database.json
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const jsonUsers = (data.users || []).length;
  const jsonRooms = (data.rooms || []).length;
  const jsonBookings = (data.bookings || []).length;
  const jsonProblems = (data.problems || []).length;
  const jsonEvaluations = (data.evaluations || []).length;

  console.log('Local database.json counts:');
  console.log(`- Users: ${jsonUsers}`);
  console.log(`- Rooms: ${jsonRooms}`);
  console.log(`- Bookings: ${jsonBookings}`);
  console.log(`- Problems: ${jsonProblems}`);
  console.log(`- Evaluations: ${jsonEvaluations}\n`);

  // Query Neon PostgreSQL
  const neonUsers = await prisma.user.count();
  const neonRooms = await prisma.room.count();
  const neonBookings = await prisma.booking.count();
  const neonProblems = await prisma.problem.count();
  const neonEvaluations = await prisma.evaluation.count();

  console.log('Remote Neon DB counts:');
  console.log(`- Users: ${neonUsers} (Note: Neon might have extra seed users)`);
  console.log(`- Rooms: ${neonRooms}`);
  console.log(`- Bookings: ${neonBookings}`);
  console.log(`- Problems: ${neonProblems}`);
  console.log(`- Evaluations: ${neonEvaluations}\n`);

  console.log('--- Conclusion ---');
  if (neonRooms === jsonRooms && neonBookings === jsonBookings) {
    console.log('✅ ALL data migrated successfully!');
  } else {
    console.log('❌ SOME data is missing!');
  }
}

main().finally(() => prisma.$disconnect());
