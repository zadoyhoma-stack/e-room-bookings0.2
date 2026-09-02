import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

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

app.use('/api/uploads', express.static(uploadsDir));

// Endpoints

// Removed root endpoint to allow React frontend to be served on '/'

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/api/uploads/${req.file.filename}` });
});

// Auth
const JWT_SECRET = process.env.JWT_SECRET || 'arit-secret-key';

// ==================== Middlewares ====================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session หมดอายุหรือ Token ไม่ถูกต้อง' });
  }
};

const verifyAdminOrStaff = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง (สำหรับ Admin/Staff เท่านั้น)' });
  }
  next();
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง (สำหรับ Admin เท่านั้น)' });
  }
  next();
};

// ==================== State Transition Rules ====================
const VALID_TRANSITIONS = {
  'pending':   ['approved', 'rejected', 'cancelled'],
  'approved':  ['cancelled', 'completed'],
  'rejected':  [],       // ห้ามเปลี่ยนต่อ (Terminal State)
  'cancelled': [],       // ห้ามเปลี่ยนต่อ (Terminal State)
  'completed': [],       // ห้ามเปลี่ยนต่อ (Terminal State)
};

// ==================== Thai Timezone Helper ====================
function getThaiNow() {
  // UTC+7 for Asia/Bangkok
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const thai = new Date(utc + (7 * 60 * 60 * 1000));
  return thai;
}

function getThaiDateStr() {
  const d = getThaiNow();
  return d.toISOString().split('T')[0];
}

function getThaiTimeStr() {
  const d = getThaiNow();
  return d.toISOString().split('T')[1].substring(0, 5);
}

// ==================== Email Notify Helper ====================
async function sendEmailNotify(toEmail, subject, text) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || !toEmail) return;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"ARIT E-ROOMs" <${user}>`,
      to: toEmail,
      subject: subject,
      text: text
    });
  } catch (err) {
    console.error('Failed to send Email Notify:', err.message);
  }
}

// ==================== System Event Logger ====================
async function logSystemEvent(action, user, type, extra) {
  try {
    const date = getThaiDateStr();
    const time = getThaiTimeStr();
    await prisma.systemLog.create({
      data: { action, user: user || 'ระบบ', type: type || 'system', date, time }
    });
    io.emit('new_log', { action, user, type, date, time, extra });
  } catch (e) {
    console.error('Failed to log event', e);
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) console.warn('WARNING: GOOGLE_CLIENT_ID is not set in environment variables');
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    // Verify Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;

    // Check domain @rmu.ac.th
    if (!email.endsWith('@rmu.ac.th')) {
      return res.status(403).json({ error: 'อนุญาตเฉพาะอีเมล @rmu.ac.th เท่านั้น' });
    }

    // Check if user exists, or create a new student
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { googleId: payload.sub },
          { email: email }
        ]
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub,
          email,
          name: name || 'นักศึกษา',
          role: 'student',
          username: email.split('@')[0], // Use email prefix as username
          profilePic: picture,
        }
      });
    } else {
      // Update profile pic, googleId, and name if they already exist
      const updateData = {};
      if (picture && user.profilePic !== picture) updateData.profilePic = picture;
      if (!user.googleId) updateData.googleId = payload.sub;
      if (name && user.name !== name) updateData.name = name; // Update name from Google

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    // Create system JWT
    const appToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logSystemEvent(`เข้าสู่ระบบด้วย Google`, `${user.name} (${user.role})`, 'security');

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token: appToken,
      user: userWithoutPassword
    });

  } catch (err) {
    console.error('[Google Auth Error]', err);
    res.status(500).json({ error: 'การยืนยันตัวตนกับ Google ล้มเหลว กรุณาตรวจสอบ Client ID' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    // ตรวจสอบว่าต้องลงท้ายด้วย @rmu.ac.th เท่านั้น
    if (!username.endsWith('@rmu.ac.th')) {
      return res.status(400).json({ error: 'อีเมลไม่ถูกต้อง (ต้องลงท้ายด้วย @rmu.ac.th เท่านั้น)' });
    }

    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logSystemEvent(`เข้าสู่ระบบสำเร็จ`, `${user.name} (${user.role})`, 'security');

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/rooms', verifyToken, verifyAdminOrStaff, async (req, res) => {
  try {
    const newRoom = await prisma.room.create({
      data: {
        id: `r${Date.now()}`,
        name: req.body.name,
        capacity: req.body.capacity,
        equipment: req.body.equipment || [],
        status: req.body.status || 'available',
        location: req.body.location || 'ไม่ได้ระบุ',
        description: req.body.description || '',
        image: req.body.image || null,
        rules: req.body.rules || [],
      }
    });
    io.emit('room_updated', newRoom);
    logSystemEvent(`เพิ่มห้องใหม่ ${newRoom.name}`, 'แอดมิน', 'system');
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.patch('/api/rooms/:id', verifyToken, verifyAdminOrStaff, async (req, res) => {
  try {
    const updated = await prisma.room.update({
      where: { id: req.params.id },
      data: req.body
    });
    io.emit('room_updated', updated);
    logSystemEvent(`แก้ไขข้อมูล/สถานะห้อง ${updated.name}`, 'แอดมิน', 'system');
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.post('/api/rooms/seed', verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      await prisma.room.createMany({
        data: req.body,
        skipDuplicates: true
      });
    }
    const count = await prisma.room.count();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
// ==================== Auto Expire Helper ====================
async function autoExpireBookings() {
  try {
    const currentDate = getThaiDateStr();
    const currentHour = getThaiTimeStr();

    const expiredBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { date: { lt: currentDate }, status: { in: ['pending', 'approved'] } },
          { date: currentDate, endTime: { lte: currentHour }, status: 'approved' }
        ]
      }
    });

    if (expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        const updated = await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'completed' }
        });
        io.emit('update_booking', updated);
      }
      console.log(`[Auto-Expire] Updated ${expiredBookings.length} expired bookings at ${currentDate} ${currentHour}`);
    }
  } catch (err) {
    console.error('[Auto-Expire Error]', err);
  }
}

// Call once on startup
autoExpireBookings();

// Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    await autoExpireBookings();
    const bookings = await prisma.booking.findMany({
      orderBy: { date: 'desc' },
      include: { 
        room: { select: { name: true } }
      }
    });
    
    // Auth Check: if not admin/staff, strip sensitive info (phone, email)
    let isAdminOrStaff = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin' || decoded.role === 'staff') {
          isAdminOrStaff = true;
        }
      } catch (e) {}
    }

    const mapped = bookings.map(b => {
      const data = { ...b, roomName: b.room.name };
      if (!isAdminOrStaff) {
        delete data.phone;
        delete data.email;
        delete data.ipAddress;
      }
      return data;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/bookings', verifyToken, async (req, res) => {
  try {
    const { roomId, roomName, date, startTime, endTime, topic, notes, participants, userId, userName, phone, email, department, participantList, extraEquipment } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const requesterInfo = `${req.user.username || req.user.id} (${req.user.role})`;

    // === Validation 1: Required Fields ===
    if (!roomId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // === Validation 2: Time Rules (08:00 - 15:00) ===
    if (startTime < '08:00' || startTime > '15:00') {
      logSystemEvent(`BOOKING_REJECTED: เวลานอกระบบ ${startTime}`, requesterInfo, 'booking');
      return res.status(400).json({ error: 'เวลาเริ่มต้นไม่อยู่ในช่วงที่อนุญาตให้จอง (08:00 - 15:00)' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ error: 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น' });
    }

    // === Validation 3: No Past Dates (Thai Timezone) ===
    const today = getThaiDateStr();
    if (date < today) {
      return res.status(400).json({ error: 'ไม่สามารถจองเวลาย้อนหลังได้' });
    }

    // === Validation 4: Room Status Check (ข้อ 10, 17) ===
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: 'ไม่พบห้องในระบบ' });
    }
    if (room.status !== 'available') {
      logSystemEvent(`BOOKING_REJECTED: ห้อง ${room.name} สถานะ ${room.status}`, requesterInfo, 'booking');
      return res.status(400).json({ error: `ห้อง ${room.name} ไม่สามารถจองได้ (สถานะ: ${room.status === 'maintenance' ? 'ปิดปรับปรุง' : room.status})` });
    }

    // === Validation 5: Prevent Double Booking — Conflict Check (ข้อ 4, 5, 21) ===
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: roomId,
        date: date,
        status: { in: ['pending', 'approved'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      }
    });

    if (overlapping) {
      logSystemEvent(`BOOKING_CONFLICT: ${roomId} ${date} ${startTime}-${endTime} ชนกับ Booking#${overlapping.id}`, requesterInfo, 'booking');
      return res.status(409).json({ error: 'ห้องนี้มีการจองในช่วงเวลาดังกล่าวแล้ว (Double Booking)' });
    }

    // === Validation 6: Double Submit Protection (ข้อ 20) ===
    const actualUserId = req.user.id || userId;
    const recentDuplicate = await prisma.booking.findFirst({
      where: {
        userId: actualUserId,
        roomId: roomId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        status: { in: ['pending', 'approved'] }
      }
    });
    if (recentDuplicate) {
      logSystemEvent(`DOUBLE_SUBMIT_BLOCKED: ${roomId} ${date} ${startTime}-${endTime}`, requesterInfo, 'booking');
      return res.status(409).json({ error: 'คุณได้ส่งคำขอจองนี้ไปแล้ว กรุณารอการอนุมัติ' });
    }

    // === Validation 7: Booking Limit (Max 2 per day per user, except Admin/Staff) ===
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      const todayBookingsCount = await prisma.booking.count({
        where: {
          userId: actualUserId,
          date: date,
          status: { in: ['pending', 'approved'] }
        }
      });
      if (todayBookingsCount >= 2) {
        logSystemEvent(`BOOKING_LIMIT_REACHED: ${actualUserId} จองเกิน 2 ครั้งในวันที่ ${date}`, requesterInfo, 'booking');
        return res.status(400).json({ error: 'คุณจองห้องครบสิทธิ์ 2 ครั้งต่อวันแล้วครับ' });
      }
    }

    // === Create User if not exists ===
    const actualUserName = userName || req.user.username || 'ผู้ใช้ทั่วไป';
    const user = await prisma.user.upsert({
      where: { id: actualUserId },
      update: {},
      create: {
        id: actualUserId,
        name: actualUserName,
        email: req.user.email || `${actualUserId}@placeholder.com`,
      }
    });

    // === Sanitize input (XSS Prevention) ===
    const sanitize = (str) => {
      if (typeof str !== 'string') return str;
      return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };

    // === Create Booking ===
    const newBooking = await prisma.booking.create({
      data: {
        roomId,
        date,
        startTime,
        endTime,
        topic: sanitize(topic) || '',
        notes: sanitize(notes) || '',
        status: 'pending',
        participants: Number(participants) || 2,
        userId: actualUserId,
        userName: sanitize(actualUserName) || null,
        phone: sanitize(phone) || null,
        email: sanitize(email) || null,
        department: sanitize(department) || null,
        participantList: participantList || [],
        extraEquipment: sanitize(extraEquipment) || null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
      }
    });

    const bookingResponse = { ...newBooking, roomName: room.name };

    io.emit('new_booking', bookingResponse);
    logSystemEvent(`BOOKING_CREATE: ${room.name} ${date} ${startTime}-${endTime} Booking#${newBooking.id}`, requesterInfo, 'booking');

    // ส่ง Email Notify เมื่อกดจองสำเร็จ
    const targetEmail = req.user.email || email;
    if (targetEmail) {
      sendEmailNotify(
        targetEmail, 
        'ยืนยันการจองห้อง ARIT E-ROOMs', 
        `🔔 แจ้งเตือนการจองสำเร็จ!\nผู้จอง: ${bookingResponse.userName}\nห้อง: ${bookingResponse.roomName}\nวันที่: ${bookingResponse.date}\nเวลา: ${bookingResponse.startTime} - ${bookingResponse.endTime}\n\nกรุณารอเจ้าหน้าที่อนุมัติการใช้งานครับ`
      );
    }

    res.status(201).json(bookingResponse);
  } catch (err) {
    console.error(err);
    logSystemEvent(`BOOKING_ERROR: ${err.message}`, 'ระบบ', 'system');
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const requesterInfo = `${req.user.username || req.user.id} (${req.user.role})`;

    if (!['pending', 'approved', 'rejected', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // === Step 1: ตรวจว่า Booking มีอยู่จริง ===
    const existing = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { room: true }
    });
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    // === Step 2: State Transition Validation (ข้อ 3) ===
    const allowedNext = VALID_TRANSITIONS[existing.status] || [];
    if (!allowedNext.includes(status)) {
      logSystemEvent(`INVALID_TRANSITION: Booking#${req.params.id} ${existing.status} → ${status}`, requesterInfo, 'booking');
      return res.status(400).json({
        error: `ไม่สามารถเปลี่ยนสถานะจาก "${existing.status}" เป็น "${status}" ได้`
      });
    }

    // === Step 3: Ownership & Role check (ข้อ 12, 13) ===
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      // Normal user can only cancel their own booking
      if (existing.userId !== req.user.id) {
        logSystemEvent(`UNAUTHORIZED_ATTEMPT: User ${req.user.id} พยายามแก้ไข Booking#${req.params.id} ของ User ${existing.userId}`, requesterInfo, 'security');
        return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขการจองของผู้อื่น' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'ผู้ใช้ทั่วไปสามารถเปลี่ยนสถานะได้เฉพาะ ยกเลิก (cancelled) เท่านั้น' });
      }
    }

    // === Step 4: Approve ต้องตรวจ Conflict ใหม่ (ข้อ 8) ===
    if (status === 'approved') {
      // 4a. ตรวจว่า Room ยัง Active
      if (existing.room && existing.room.status !== 'available') {
        logSystemEvent(`APPROVE_DENIED: ห้อง ${existing.room.name} สถานะ ${existing.room.status}`, requesterInfo, 'booking');
        return res.status(400).json({ error: `ไม่สามารถอนุมัติได้ ห้อง ${existing.room.name} สถานะ: ${existing.room.status}` });
      }

      // 4b. ตรวจว่าวันที่ยังไม่เป็นอดีต
      const today = getThaiDateStr();
      if (existing.date < today) {
        return res.status(400).json({ error: 'ไม่สามารถอนุมัติได้ วันที่จองผ่านไปแล้ว' });
      }

      // 4c. ตรวจ Conflict ใหม่ (Exclude ตัวเอง)
      const conflicting = await prisma.booking.findFirst({
        where: {
          id: { not: req.params.id },  // Exclude ตัวเอง
          roomId: existing.roomId,
          date: existing.date,
          status: { in: ['approved'] },  // ตรวจเฉพาะที่ approved แล้ว
          startTime: { lt: existing.endTime },
          endTime: { gt: existing.startTime }
        }
      });

      if (conflicting) {
        logSystemEvent(`APPROVE_CONFLICT_DENIED: Booking#${req.params.id} ชนกับ Booking#${conflicting.id} (${existing.roomId} ${existing.date} ${existing.startTime}-${existing.endTime})`, requesterInfo, 'booking');
        return res.status(409).json({
          error: `ไม่สามารถอนุมัติได้ เนื่องจากช่วงเวลานี้มีการจองที่อนุมัติแล้วขัดแย้งกัน (Booking #${conflicting.id.substring(0,8)}...)`
        });
      }
    }

    // === Step 5: Execute Update ===
    const updateData = { status };
    // ถ้าเป็น approve/reject ให้บันทึกข้อมูลผู้ดำเนินการ
    if (status === 'approved' || status === 'rejected') {
      updateData.reviewedBy = req.user.username || req.user.id;
      updateData.reviewedAt = new Date();
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData
    });

    // === Step 6: Emit + Log ===
    io.emit('update_booking', updated);
    const actionLabel = status === 'approved' ? 'BOOKING_APPROVE' :
                        status === 'rejected' ? 'BOOKING_REJECT' :
                        status === 'cancelled' ? 'BOOKING_CANCEL' : `STATUS_CHANGE_${status.toUpperCase()}`;
    logSystemEvent(`${actionLabel}: Booking#${req.params.id} ${existing.roomId} ${existing.date} ${existing.startTime}-${existing.endTime}`, requesterInfo, 'booking');
    res.json(updated);
  } catch (err) {
    console.error('[PATCH bookings/:id Error]', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Problems
app.post('/api/problems', async (req, res) => {
  try {
    const { room, roomId, problemType, details, urgency, rating, image } = req.body;
    const actualRoomId = roomId || room;
    if (!actualRoomId || !problemType || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProblem = await prisma.problem.create({
      data: {
        roomId: actualRoomId,
        problemType,
        details,
        image: image || null,
        urgency: urgency || 'medium',
        status: 'pending',
        rating: rating || 0
      }
    });

    io.emit('new_problem', newProblem);
    res.status(201).json(newProblem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/problems', async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({ orderBy: { reportedAt: 'desc' } });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.patch('/api/problems/:id', verifyToken, verifyAdminOrStaff, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.problem.update({
      where: { id: req.params.id },
      data: { status }
    });
    io.emit('update_problem', updated);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: 'Problem not found' });
  }
});

// Evaluations
app.post('/api/evaluations', async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const newEval = await prisma.evaluation.create({
      data: {
        rating,
        feedback: feedback || ''
      }
    });
    io.emit('new_evaluation', newEval);
    res.status(201).json(newEval);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/evaluations', async (req, res) => {
  try {
    const evals = await prisma.evaluation.findMany({ orderBy: { submittedAt: 'desc' } });
    res.json(evals);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Users
app.get('/api/users', verifyToken, verifyAdminOrStaff, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' }
    });
    // Sanitize passwords from response
    const sanitized = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.patch('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Allow users to edit their own profile, or admins to edit anyone
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขข้อมูลผู้อื่น' });
    }

    const updates = req.body;
    
    // เข้ารหัส (Hash) รหัสผ่านใหม่ก่อนบันทึกลง Database
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    
    // ตรวจสอบการจำกัดจำนวนครั้งการแก้ไขต่อวัน (5 ครั้ง)
    if (updates.profilePic !== undefined || updates.nickname !== undefined) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const today = new Date().toISOString().split('T')[0];
      let editCount = user.profileEditCount || 0;
      let editDate = user.lastProfileEditDate || '';

      if (editDate !== today) {
        editCount = 0; // รีเซ็ตสำหรับวันใหม่
      }

      if (editCount >= 5) {
        return res.status(429).json({ error: 'คุณเปลี่ยนข้อมูลครบกำหนดของวันนี้แล้ว ลองใหม่ในวันพรุ่งนี้' });
      }

      updates.profileEditCount = editCount + 1;
      updates.lastProfileEditDate = today;
    }
    
    const updated = await prisma.user.update({
      where: { id },
      data: updates
    });
    logSystemEvent(`อัปเดตข้อมูลผู้ใช้ ${updated.name}`, updated.name, 'user');
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin user' });

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// System Logs & Reports
app.get('/api/logs', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const logs = await prisma.systemLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/logs', verifyToken, async (req, res) => {
  try {
    const { action, user, type } = req.body;
    await logSystemEvent(action, user, type);
    res.status(201).json({ message: 'Log created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports', verifyToken, verifyAdminOrStaff, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/reports', verifyToken, verifyAdminOrStaff, async (req, res) => {
  try {
    const { type, room, format } = req.body;
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const date = localDate.toISOString().split('T')[0];

    const report = await prisma.report.create({
      data: { type, room, format: format || 'PDF', date, status: 'Generated' }
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-expire bookings every 30s (using Thai Timezone)
setInterval(autoExpireBookings, 30000);

// ==================== Auto LINE Reminder (15 Mins Before) ====================
const notifiedReminders = new Set();
setInterval(async () => {
  try {
    const thaiDate = getThaiNow();
    const currentDate = getThaiDateStr();
    const currentTotalMinutes = thaiDate.getHours() * 60 + thaiDate.getMinutes();

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: 'approved',
        date: currentDate
      },
      include: { room: true }
    });

    for (const b of upcomingBookings) {
      const [h, m] = b.startTime.split(':').map(Number);
      const startTotalMinutes = h * 60 + m;
      const minutesRemaining = startTotalMinutes - currentTotalMinutes;

      // ถ้าเหลือเวลา 15 นาที และยังไม่เคยแจ้งเตือน
      if (minutesRemaining > 0 && minutesRemaining <= 15 && !notifiedReminders.has(b.id)) {
        notifiedReminders.add(b.id);
        const targetEmail = b.email || `${b.userId}@rmu.ac.th`; // Fallback email
        sendEmailNotify(
          targetEmail,
          '⏰ เตือนความจำการจองห้อง!',
          `ห้อง: ${b.room.name}\nกำลังจะเริ่มใช้งานในอีก ${minutesRemaining} นาที\n(เวลา ${b.startTime} น.)\nผู้จอง: ${b.userName || b.userId}\n\nกรุณาเข้าใช้งานให้ตรงเวลาครับ`
        );
      }
    }
  } catch (err) {
    console.error('[Auto-Line-Reminder Error]', err);
  }
}, 60000); // Check every 60 seconds

// ==================== Serve React Frontend (Production) ====================
// Check if running in production or if the dist folder exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  console.log(`Serving static files from ${distPath}`);
  app.use(express.static(distPath));

  // Handle React Router (Fallback for all non-API routes)
  app.get('*', (req, res) => {
    // Only fallback for non-API requests
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
} else {
  console.log("No 'dist' folder found. Running in development mode.");
}

httpServer.listen(PORT, () => {
  console.log(`ARIT E-ROOMs backend running on http://localhost:${PORT}`);
});
