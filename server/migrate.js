import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

async function main() {
  console.log('Reading database.json...');
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

  console.log('Migrating Users...');
  for (const user of data.users || []) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name || '',
        nickname: user.nickname || '',
        email: user.email || '',
        role: user.role || 'student',
        department: user.department || '',
        studentId: user.studentId || '',
        profilePic: user.profilePic || null,
      },
      create: {
        id: user.id,
        name: user.name || '',
        nickname: user.nickname || '',
        email: user.email || '',
        role: user.role || 'student',
        department: user.department || '',
        studentId: user.studentId || '',
        profilePic: user.profilePic || null,
      }
    });
  }

  console.log('Migrating Rooms...');
  for (const room of data.rooms || []) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {
        status: room.status,
        name: room.name,
      },
      create: {
        id: room.id,
        name: room.name || '',
        capacity: room.capacity || 0,
        equipment: room.equipment || [],
        status: room.status || 'available',
        location: room.location || '',
        description: room.description || '',
        rules: room.rules || [],
      }
    });
  }

  console.log('Migrating Bookings...');
  for (const booking of data.bookings || []) {
    // Ensure the room exists first
    const roomExists = await prisma.room.findUnique({ where: { id: booking.roomId } });
    if (!roomExists) continue;

    // Default to a dummy user if user doesn't exist
    let userId = booking.userId || 'anonymous';
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      await prisma.user.upsert({
        where: { id: 'anonymous' },
        update: {},
        create: {
          id: 'anonymous',
          name: 'ผู้ใช้ทั่วไป',
          email: 'anonymous@localhost',
          role: 'student'
        }
      });
      userId = 'anonymous';
    }

    await prisma.booking.upsert({
      where: { id: booking.id },
      update: {
        status: booking.status,
        userName: booking.userName || null,
        phone: booking.phone || null,
        email: booking.email || null,
        department: booking.department || null,
        extraEquipment: booking.extraEquipment || null,
      },
      create: {
        id: booking.id,
        roomId: booking.roomId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        topic: booking.topic || '',
        notes: booking.notes || '',
        status: booking.status || 'pending',
        participants: booking.participants || 2,
        userId: userId,
        userName: booking.userName || null,
        phone: booking.phone || null,
        email: booking.email || null,
        department: booking.department || null,
        participantList: booking.participantList || [],
        extraEquipment: booking.extraEquipment || null,
      }
    });
  }

  console.log('Migrating Problems...');
  for (const problem of data.problems || []) {
    const roomExists = await prisma.room.findUnique({ where: { id: problem.roomId } });
    if (!roomExists) continue;

    await prisma.problem.upsert({
      where: { id: problem.id },
      update: {
        status: problem.status,
      },
      create: {
        id: problem.id,
        roomId: problem.roomId,
        problemType: problem.problemType || '',
        details: problem.details || '',
        image: problem.image || null,
        urgency: problem.urgency || 'medium',
        status: problem.status || 'pending',
        rating: problem.rating || 0,
        reportedAt: problem.reportedAt ? new Date(problem.reportedAt) : new Date(),
      }
    });
  }

  console.log('Migrating Evaluations...');
  for (const evaluation of data.evaluations || []) {
    await prisma.evaluation.upsert({
      where: { id: evaluation.id },
      update: {},
      create: {
        id: evaluation.id,
        rating: evaluation.rating || 0,
        feedback: evaluation.feedback || '',
        submittedAt: evaluation.submittedAt ? new Date(evaluation.submittedAt) : new Date(),
      }
    });
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
