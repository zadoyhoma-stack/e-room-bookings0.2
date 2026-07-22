import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  },
  // ===== ปรับปรุง Socket.IO ให้เสถียรขึ้น =====
  pingTimeout: 60000,
  pingInterval: 25000,
});
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Prevent caching for all API requests
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Setup uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use('/api/uploads', express.static(uploadsDir));

// ===== In-Memory Database Cache =====
// แทนที่จะอ่าน/เขียนไฟล์ทุก request (blocking I/O)
// เก็บ data ใน memory แล้วเขียนไฟล์แบบ debounced async
let dbCache = null;
let writeTimer = null;
const WRITE_DELAY = 2000; // เขียนไฟล์หลังจากไม่มีการเปลี่ยนแปลง 2 วินาที

const readDB = () => {
  if (dbCache) return dbCache;
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    dbCache = JSON.parse(data);
    if (!dbCache.rooms) dbCache.rooms = [];
    if (!dbCache.bookings) dbCache.bookings = [];
    if (!dbCache.problems) dbCache.problems = [];
    if (!dbCache.evaluations) dbCache.evaluations = [];
    if (!dbCache.users) dbCache.users = [];
    return dbCache;
  } catch (error) {
    console.error('Error reading database file:', error);
    dbCache = { rooms: [], bookings: [], problems: [], evaluations: [], users: [] };
    return dbCache;
  }
};

// Debounced async write — ไม่ block event loop
const writeDB = (data) => {
  dbCache = data; // อัปเดต cache ทันที

  // Clear timer เก่า แล้วตั้งใหม่
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing database file:', err);
      }
    });
  }, WRITE_DELAY);
};

// Force flush — สำหรับ graceful shutdown
const flushDB = () => {
  if (dbCache && writeTimer) {
    clearTimeout(writeTimer);
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dbCache, null, 2), 'utf8');
      console.log('[DB] Flushed to disk on shutdown');
    } catch (err) {
      console.error('[DB] Error flushing:', err);
    }
  }
};

// Graceful shutdown — เขียนไฟล์ก่อนปิด
process.on('SIGINT', () => { flushDB(); process.exit(0); });
process.on('SIGTERM', () => { flushDB(); process.exit(0); });

// โหลด database เข้า cache ตั้งแต่เริ่มต้น
readDB();
console.log('[DB] Database loaded into memory cache');

// Endpoints

app.get('/', (req, res) => {
  res.send('ARIT E-ROOMs Backend is running successfully!');
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

// 1. Get all rooms
app.get('/api/rooms', (req, res) => {
  const db = readDB();
  res.json(db.rooms);
});

// 1.5 Update a room (e.g. status, details)
app.patch('/api/rooms/:id', (req, res) => {
  const db = readDB();
  const roomIndex = db.rooms.findIndex(r => r.id === req.params.id);
  
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const updates = req.body;
  db.rooms[roomIndex] = { ...db.rooms[roomIndex], ...updates };
  
  writeDB(db);
  io.emit('room_updated', db.rooms[roomIndex]);
  res.json(db.rooms[roomIndex]);
});

// Seed rooms endpoint
app.post('/api/rooms/seed', (req, res) => {
  const db = readDB();
  if (Array.isArray(req.body)) {
    db.rooms = req.body;
    writeDB(db);
  }
  res.json({ success: true, count: db.rooms.length });
});

// 2. Get all bookings
app.get('/api/bookings', (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

// 3. Create a new booking request
app.post('/api/bookings', (req, res) => {
  const db = readDB();
  const { roomId, roomName, date, startTime, endTime, topic, notes, participants, userId, userName } = req.body;

  if (!roomId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for overlapping bookings
  const overlappingBooking = db.bookings.find(b =>
    b.roomId === roomId &&
    b.date === date &&
    (b.status === 'pending' || b.status === 'approved') &&
    (
      (startTime >= b.startTime && startTime < b.endTime) ||
      (endTime > b.startTime && endTime <= b.endTime) ||
      (startTime <= b.startTime && endTime >= b.endTime)
    )
  );

  if (overlappingBooking) {
    return res.status(409).json({ error: 'ห้องนี้มีการจองในช่วงเวลาดังกล่าวแล้ว' });
  }

  const newBooking = {
    id: `b${Date.now()}`,
    roomId,
    roomName,
    date,
    startTime,
    endTime,
    topic: topic || '',
    notes: notes || '',
    status: 'pending',
    participants: Number(participants) || 2,
    userId: userId || 'anonymous',
    userName: userName || 'ผู้ใช้ทั่วไป'
  };

  db.bookings.unshift(newBooking); // Add new booking to the top
  writeDB(db);

  io.emit('new_booking', newBooking);

  res.status(201).json(newBooking);
});

// 4. Update booking status (approve, reject, cancel)
app.patch('/api/bookings/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  db.bookings[bookingIndex].status = status;
  writeDB(db);

  io.emit('update_booking', db.bookings[bookingIndex]);

  res.json(db.bookings[bookingIndex]);
});

// 5. Report a problem
app.post('/api/problems', (req, res) => {
  const db = readDB();
  const { room, problemType, details, urgency, rating, image } = req.body;

  if (!room || !problemType || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newProblem = {
    id: `p${Date.now()}`,
    roomId: room,
    problemType,
    details,
    image: image || null,
    urgency: urgency || 'medium',
    rating: rating || 0,
    status: 'pending',
    reportedAt: new Date().toISOString()
  };

  db.problems.unshift(newProblem);
  writeDB(db);

  io.emit('new_problem', newProblem);

  res.status(201).json(newProblem);
});

// Get all problems
app.get('/api/problems', (req, res) => {
  const db = readDB();
  res.json(db.problems || []);
});

// Update problem status
app.patch('/api/problems/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body;

  if (!db.problems) db.problems = [];

  const problemIndex = db.problems.findIndex(p => p.id === id);
  if (problemIndex === -1) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  db.problems[problemIndex].status = status;
  writeDB(db);

  io.emit('update_problem', db.problems[problemIndex]);

  res.json(db.problems[problemIndex]);
});

// 8. Submit an evaluation
app.post('/api/evaluations', (req, res) => {
  const db = readDB();
  const { rating, feedback } = req.body;

  if (!db.evaluations) db.evaluations = [];

  const newEvaluation = {
    id: `e${Date.now()}`,
    rating,
    feedback: feedback || '',
    submittedAt: new Date().toISOString()
  };

  db.evaluations.unshift(newEvaluation);
  writeDB(db);

  io.emit('new_evaluation', newEvaluation);

  res.status(201).json(newEvaluation);
});

// Get all evaluations
app.get('/api/evaluations', (req, res) => {
  const db = readDB();
  res.json(db.evaluations || []);
});

// 6. Get all users
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users || []);
});

// 7. Update user
app.patch('/api/users/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updates = req.body;

  if (!db.users) db.users = [];

  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = db.users[userIndex];

  // ตรวจสอบการจำกัดจำนวนครั้งการแก้ไขต่อวัน (5 ครั้ง)
  if (updates.profilePic !== undefined || updates.nickname !== undefined) {
    const today = new Date().toISOString().split('T')[0];
    if (!user.editStats) user.editStats = { date: today, count: 0 };

    if (user.editStats.date !== today) {
      user.editStats = { date: today, count: 0 }; // รีเซ็ตสำหรับวันใหม่
    }

    if (user.editStats.count >= 5) {
      return res.status(429).json({ error: 'คุณเปลี่ยนข้อมูลครบกำหนดของวันนี้แล้ว ลองใหม่ในวันพรุ่งนี้' });
    }

    user.editStats.count += 1;
  }

  db.users[userIndex] = { ...user, ...updates };
  writeDB(db);

  res.json(db.users[userIndex]);
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  if (!db.users) db.users = [];

  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Don't allow deleting admin
  if (db.users[userIndex].role === 'admin') {
    return res.status(403).json({ error: 'Cannot delete admin user' });
  }

  const deletedUser = db.users.splice(userIndex, 1)[0];
  writeDB(db);

  res.json({ message: 'User deleted', user: deletedUser });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`ARIT E-ROOMs backend running on http://localhost:${PORT}`);
});

// Auto-expire bookings based on real time
setInterval(() => {
  const db = readDB();
  let updated = false;
  
  const now = new Date();
  // Adjust for local timezone if needed, or use UTC. Assuming server uses local time.
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  const currentDate = localDate.toISOString().split('T')[0];
  const currentHour = localDate.toISOString().split('T')[1].substring(0, 5);

  db.bookings.forEach(booking => {
    if (booking.status === 'approved' || booking.status === 'pending') {
      if (booking.date < currentDate || (booking.date === currentDate && booking.endTime <= currentHour)) {
        booking.status = 'completed'; 
        updated = true;
        io.emit('update_booking', booking);
      }
    }
  });

  if (updated) {
    writeDB(db);
    console.log(`[Auto-Expire] Updated expired bookings at ${currentDate} ${currentHour}`);
  }
}, 30000); // Check every 30 seconds
