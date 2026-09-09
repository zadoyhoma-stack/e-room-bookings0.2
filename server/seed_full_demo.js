import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getThaiDateStr(offsetDays = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const thai = new Date(utc + (7 * 60 * 60 * 1000));
  return thai.toISOString().split('T')[0];
}

async function main() {
  console.log('🌱 Starting Full Demo Seeding to Local PostgreSQL...');

  const password = await bcrypt.hash('admin123456', 10);

  // 1. Users
  console.log('👤 Seeding Users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rmu.ac.th' },
    update: { password, role: 'admin', username: 'admin', name: 'ผู้ดูแลระบบ (แอดมิน)' },
    create: {
      email: 'admin@rmu.ac.th',
      username: 'admin',
      password,
      name: 'ผู้ดูแลระบบ (แอดมิน)',
      nickname: 'แอดมิน',
      role: 'admin',
      department: 'สำนักวิทยบริการฯ'
    }
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff01@rmu.ac.th' },
    update: { password, role: 'staff', username: 'staff01', name: 'สมใจ รักงาน (เจ้าหน้าที่)' },
    create: {
      email: 'staff01@rmu.ac.th',
      username: 'staff01',
      password,
      name: 'สมใจ รักงาน (เจ้าหน้าที่)',
      nickname: 'ใจ',
      role: 'staff',
      department: 'สำนักวิทยบริการฯ'
    }
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student01@rmu.ac.th' },
    update: { password, role: 'student', username: 'student01', name: 'สมชาย เรียนดี (นักศึกษา)' },
    create: {
      email: 'student01@rmu.ac.th',
      username: 'student01',
      password,
      name: 'สมชาย เรียนดี (นักศึกษา)',
      nickname: 'ชาย',
      role: 'student',
      department: 'คณะเทคโนโลยีสารสนเทศ'
    }
  });

  // 2. Rooms
  console.log('🚪 Seeding Rooms (14 rooms)...');
  const roomsData = [
    {
      id: 'r1', name: 'ห้องประชุมอาเซียน (ASEAN)', capacity: 15,
      equipment: ['wifi', 'projector', 'tv', 'microphone', 'whiteboard'],
      status: 'available', location: 'ชั้น 2',
      description: 'ห้องประชุมระดับพรีเมียม ตกแต่งในธีมอาเซียน รองรับผู้เข้าร่วมประชุมสูงสุด 15 ท่าน พร้อมโต๊ะประชุมรูปตัว U ระบบภาพและเสียงครบครัน เหมาะสำหรับการประชุมผู้บริหาร, สัมมนากลุ่มย่อย และการนำเสนอผลงาน',
      rules: ['ห้ามนำอาหารและเครื่องดื่มเข้าห้อง', 'รักษาความสะอาดและจัดเก้าอี้คืนที่เดิมก่อนออก', 'ปิดไฟ, แอร์ และอุปกรณ์ทุกชนิดเมื่อใช้งานเสร็จ', 'กรุณาจองล่วงหน้าอย่างน้อย 1 วันทำการ'],
    },
    {
      id: 'r2', name: 'ห้องประชุมสำนักงาน', capacity: 10,
      equipment: ['wifi', 'projector', 'tv', 'whiteboard'],
      status: 'available', location: 'ชั้น 1',
      description: 'ห้องประชุมสำนักงานชั้น 1 บรรยากาศเป็นส่วนตัว รองรับ 10 ท่าน มีจอทีวีขนาดใหญ่, Projector และสาย HDMI พร้อมไวท์บอร์ดสำหรับระดมความคิด เหมาะสำหรับประชุมทีมงาน, หารือโครงการ และนัดหมายภายใน',
      rules: ['ห้ามนำอาหารเข้าห้อง', 'ดูแลอุปกรณ์และทรัพย์สินของห้องประชุม', 'หลีกเลี่ยงการทำเสียงดังรบกวนพื้นที่ข้างเคียง', 'ตรวจสอบความเรียบร้อยก่อนออกจากห้อง'],
    },
    {
      id: 'r3', name: 'ห้องกลุ่มย่อย ชั้น 2: ข้างบันได #1', capacity: 4,
      equipment: ['wifi', 'powerstrip'],
      status: 'available', location: 'ชั้น 2',
      description: 'ห้องกลุ่มย่อยขนาดเล็กกะทัดรัด รองรับ 4 ท่าน ตั้งอยู่บริเวณข้างบันไดชั้น 2 เหมาะสำหรับประชุมกลุ่มเล็ก, ทำงานกลุ่ม หรือพูดคุยหารือแบบส่วนตัว พร้อม Wi-Fi ความเร็วสูงและปลั๊กไฟพร้อมใช้งาน',
      rules: ['รักษาความสะอาดและความเป็นระเบียบ', 'ใช้เสียงเบาเพื่อไม่รบกวนผู้อื่น', 'ปิดไฟและแอร์เมื่อใช้งานเสร็จ'],
    },
    {
      id: 'r4', name: 'ห้องกลุ่มย่อย ชั้น 2: ข้างบันได #2', capacity: 4,
      equipment: ['wifi', 'powerstrip'],
      status: 'available', location: 'ชั้น 2',
      description: 'ห้องกลุ่มย่อยขนาดเล็กกะทัดรัด รองรับ 4 ท่าน ตั้งอยู่บริเวณข้างบันไดชั้น 2 (ห้องที่ 2) เหมาะสำหรับนัดประชุมทีมเล็กๆ, ติวหนังสือ หรือทำรายงานกลุ่ม บรรยากาศเงียบสงบเป็นส่วนตัว',
      rules: ['รักษาความสะอาดและความเป็นระเบียบ', 'ใช้เสียงเบาเพื่อไม่รบกวนผู้อื่น', 'ปิดไฟและแอร์เมื่อใช้งานเสร็จ'],
    },
    {
      id: 'r5', name: 'ห้องศึกษากลุ่ม ชั้น 4 : Study Room 1', capacity: 6,
      equipment: ['wifi', 'powerstrip', 'whiteboard'],
      status: 'available', location: 'ชั้น 4',
      description: 'ห้องศึกษากลุ่มพร้อมไวท์บอร์ด รองรับ 6 ท่าน ออกแบบมาเพื่อการเรียนรู้แบบกลุ่ม มีโต๊ะทำงานขนาดใหญ่, เก้าอี้นั่งสบาย และ Wi-Fi ความเร็วสูง เหมาะสำหรับติวสอบ, ทำโปรเจกต์กลุ่ม และอภิปราย',
      rules: ['รักษาความสะอาดและจัดเก้าอี้คืนที่เดิม', 'ห้ามนำอาหารที่มีกลิ่นแรงเข้าห้อง', 'ใช้งานไวท์บอร์ดเสร็จกรุณาลบให้เรียบร้อย'],
    },
    {
      id: 'r6', name: 'ห้องศึกษากลุ่ม ชั้น 4 : Study Room 2', capacity: 6,
      equipment: ['wifi', 'powerstrip', 'whiteboard'],
      status: 'available', location: 'ชั้น 4',
      description: 'ห้องศึกษากลุ่มพร้อมไวท์บอร์ด รองรับ 6 ท่าน บรรยากาศเงียบสงบเหมาะแก่การเรียนรู้ มีปลั๊กไฟเพียงพอสำหรับโน้ตบุ๊กทุกคน เหมาะสำหรับเตรียมสอบ, ฝึกนำเสนอ (Presentation) และระดมสมอง',
      rules: ['รักษาความสะอาดและจัดเก้าอี้คืนที่เดิม', 'ห้ามนำอาหารที่มีกลิ่นแรงเข้าห้อง', 'ใช้งานไวท์บอร์ดเสร็จกรุณาลบให้เรียบร้อย'],
    },
    {
      id: 'r7', name: 'ห้องปฏิบัติการคอมพิวเตอร์ ชั้น 4 (30 ที่นั่ง)', capacity: 30,
      equipment: ['wifi', 'projector', 'powerstrip'],
      status: 'available', location: 'ชั้น 4',
      description: 'ห้องปฏิบัติการคอมพิวเตอร์ขนาดใหญ่ รองรับ 30 ที่นั่ง พร้อมเครื่องคอมพิวเตอร์สมรรถนะสูง, จอ Projector สำหรับสอนสาธิต และระบบ Wi-Fi ความเร็วสูง เหมาะสำหรับจัดอบรมเชิงปฏิบัติการ, Workshop ด้าน IT และการเรียนการสอนที่ต้องใช้คอมพิวเตอร์',
      rules: ['ห้ามนำอาหารและเครื่องดื่มเข้าห้องโดยเด็ดขาด', 'ห้ามติดตั้งโปรแกรมหรือเปลี่ยนแปลงการตั้งค่าเครื่อง', 'ปิดเครื่องคอมพิวเตอร์ให้เรียบร้อยเมื่อใช้งานเสร็จ', 'แจ้งเจ้าหน้าที่หากพบอุปกรณ์ชำรุดหรือเสียหาย'],
    },
    {
      id: 'r8', name: 'ห้องประชุม ชั้น 4 (24 ที่นั่ง)', capacity: 24,
      equipment: ['wifi', 'projector', 'microphone', 'whiteboard', 'powerstrip'],
      status: 'available', location: 'ชั้น 4',
      description: 'ห้องประชุมขนาดกลาง รองรับ 24 ท่าน พร้อมระบบเสียงไมโครโฟน, จอ Projector ขนาดใหญ่ และไวท์บอร์ด จัดที่นั่งแบบ Theater Style หรือ Classroom ได้ตามความต้องการ เหมาะสำหรับการประชุมหน่วยงาน, สัมมนา และการนำเสนอผลงาน',
      rules: ['ห้ามนำอาหารและเครื่องดื่มเข้าห้อง', 'ดูแลอุปกรณ์และทรัพย์สินของห้องประชุม', 'จัดเก้าอี้และโต๊ะคืนที่เดิมเมื่อเสร็จสิ้น', 'ปิดอุปกรณ์ทุกชนิดก่อนออกจากห้อง'],
    },
    {
      id: 'r9', name: 'ห้องศึกษากลุ่ม ชั้น 4 : Study Room 3', capacity: 6,
      equipment: ['wifi', 'powerstrip', 'whiteboard'],
      status: 'available', location: 'ชั้น 4',
      description: 'ห้องศึกษากลุ่มพร้อมไวท์บอร์ด รองรับ 6 ท่าน บรรยากาศผ่อนคลายส่งเสริมการเรียนรู้ เหมาะสำหรับนักศึกษาที่ต้องการพื้นที่ส่วนตัวสำหรับติวสอบ, ซ้อมนำเสนอ หรือประชุมกลุ่มย่อย',
      rules: ['รักษาความสะอาดและจัดเก้าอี้คืนที่เดิม', 'ห้ามนำอาหารที่มีกลิ่นแรงเข้าห้อง', 'ใช้งานไวท์บอร์ดเสร็จกรุณาลบให้เรียบร้อย'],
    },
    {
      id: 'r10', name: 'ห้องกลุ่มย่อย ชั้น 4: ข้างบันได (ห้องค้นคว้า 1)', capacity: 4,
      equipment: ['wifi', 'powerstrip'],
      status: 'available', location: 'ชั้น 4',
      description: 'ห้องค้นคว้าขนาดเล็กกะทัดรัด รองรับ 4 ท่าน ตั้งอยู่บริเวณข้างบันไดชั้น 4 เหมาะสำหรับค้นคว้าข้อมูล, เขียนรายงาน หรือทำงานวิจัยแบบกลุ่มเล็ก บรรยากาศเงียบสงบเหมาะแก่การมีสมาธิ',
      rules: ['รักษาความสะอาดและความเป็นระเบียบ', 'ใช้เสียงเบาเพื่อไม่รบกวนผู้อื่น', 'ปิดไฟและแอร์เมื่อใช้งานเสร็จ'],
    },
    {
      id: 'r11', name: 'ห้องเรียน ชั้น 5', capacity: 30,
      equipment: ['wifi', 'projector', 'microphone', 'whiteboard'],
      status: 'available', location: 'ชั้น 5',
      description: 'ห้องเรียนขนาดมาตรฐาน รองรับ 30 ท่าน พร้อมจอ Projector, ระบบไมโครโฟน และไวท์บอร์ด จัดที่นั่งแบบ Classroom เหมาะสำหรับการเรียนการสอน, จัดอบรม และบรรยายพิเศษ',
      rules: ['ห้ามนำอาหารและเครื่องดื่มเข้าห้อง', 'จัดเก้าอี้และโต๊ะคืนที่เดิมเมื่อเสร็จสิ้น', 'ปิดอุปกรณ์ทุกชนิดก่อนออกจากห้อง', 'รักษาสภาพแวดล้อมให้พร้อมสำหรับผู้ใช้บริการรายถัดไป'],
    },
    {
      id: 'r12', name: 'ห้องสอนออนไลน์ (สำหรับผู้สอน)', capacity: 2,
      equipment: ['wifi', 'projector', 'microphone', 'videoconf'],
      status: 'available', location: 'ชั้น 5',
      description: 'ห้องสอนออนไลน์เฉพาะทาง ออกแบบมาสำหรับอาจารย์ผู้สอน รองรับ 2 ท่าน พร้อมระบบประชุมทางไกล (Video Conference), กล้องเว็บแคม HD, ไมโครโฟนคุณภาพสูง และฉากหลังสำหรับถ่ายทำ เหมาะสำหรับบันทึกการสอน, สอนออนไลน์แบบ Live และประชุมทางไกล',
      rules: ['สำหรับอาจารย์และบุคลากรเท่านั้น', 'กรุณาจองล่วงหน้าอย่างน้อย 1 วันทำการ', 'ห้ามเปลี่ยนแปลงการตั้งค่าอุปกรณ์ถ่ายทอด', 'แจ้งเจ้าหน้าที่หากต้องการความช่วยเหลือด้านเทคนิค'],
    },
    {
      id: 'r13', name: 'ห้องประชุม ชั้น 6', capacity: 80,
      equipment: ['wifi', 'projector', 'microphone', 'tv', 'whiteboard', 'videoconf'],
      status: 'available', location: 'ชั้น 6',
      description: 'ห้องประชุมขนาดใหญ่ระดับพรีเมียม รองรับสูงสุด 80 ท่าน พร้อมระบบเสียงรอบทิศทาง, ไมโครโฟนไร้สาย, จอ Projector HD ขนาดใหญ่, จอ LED TV และระบบประชุมทางไกล เหมาะสำหรับจัดสัมมนาใหญ่, อบรมเชิงปฏิบัติการ, งานพิธีเปิด-ปิดโครงการ และกิจกรรมระดับมหาวิทยาลัย',
      rules: ['ห้ามนำอาหารและเครื่องดื่มเข้าห้องโดยเด็ดขาด', 'ต้องจองล่วงหน้าอย่างน้อย 3 วันทำการ', 'ผู้จองต้องรับผิดชอบดูแลความเรียบร้อยของห้องหลังใช้งาน', 'ห้ามเคลื่อนย้ายอุปกรณ์ถาวรออกจากห้องโดยไม่ได้รับอนุญาต', 'ร่วมกันรักษาห้องประชุมให้พร้อมสำหรับผู้ใช้บริการรายถัดไป'],
    },
    {
      id: 'r14', name: 'ห้องกลุ่มย่อย ชั้น 3: ข้างบันได #1', capacity: 4,
      equipment: ['wifi', 'powerstrip'],
      status: 'available', location: 'ชั้น 3',
      description: 'ห้องกลุ่มย่อยขนาดเล็กกะทัดรัด รองรับ 4 ท่าน ตั้งอยู่บริเวณข้างบันไดชั้น 3 เหมาะสำหรับนัดหมายสั้นๆ, ปรึกษาหารือ หรือทำงานกลุ่มย่อย บรรยากาศเป็นส่วนตัวและเงียบสงบ',
      rules: ['รักษาความสะอาดและความเป็นระเบียบ', 'ใช้เสียงเบาเพื่อไม่รบกวนผู้อื่น', 'ปิดไฟและแอร์เมื่อใช้งานเสร็จ'],
    },
  ];

  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }

  // 3. Bookings
  console.log('📅 Seeding Bookings...');
  const today = getThaiDateStr(0);
  const tomorrow = getThaiDateStr(1);
  const dayAfterTomorrow = getThaiDateStr(2);

  // Clear old demo bookings to prevent primary key conflict
  await prisma.booking.deleteMany({
    where: {
      userId: { in: [adminUser.id, staffUser.id, studentUser.id] }
    }
  });

  await prisma.booking.createMany({
    data: [
      {
        roomId: 'r1',
        date: today,
        startTime: '09:00',
        endTime: '11:00',
        topic: 'ประชุมเตรียมความพร้อมนำเสนอโปรเจกต์อาจารย์',
        notes: 'ต้องการใช้งาน Smart TV สำหรับเปิดสไลด์',
        status: 'approved',
        participants: 5,
        userId: studentUser.id,
        userName: studentUser.name,
        phone: '081-234-5678',
        email: studentUser.email,
        department: 'คณะเทคโนโลยีสารสนเทศ',
        reviewedBy: 'สมใจ รักงาน (เจ้าหน้าที่)',
        reviewedAt: new Date()
      },
      {
        roomId: 'r1',
        date: today,
        startTime: '13:00',
        endTime: '15:00',
        topic: 'ทบทวนเนื้อหาวิชาการพัฒนาเว็บแอปพลิเคชัน',
        notes: 'ใช้งานกลุ่มย่อยนักศึกษาปี 4',
        status: 'pending',
        participants: 4,
        userId: studentUser.id,
        userName: studentUser.name,
        phone: '081-234-5678',
        email: studentUser.email,
        department: 'คณะเทคโนโลยีสารสนเทศ'
      },
      {
        roomId: 'r2',
        date: tomorrow,
        startTime: '10:00',
        endTime: '12:00',
        topic: 'สัมมนาการใช้งานฐานข้อมูล PostgreSQL สำหรับไอที',
        notes: 'ขอใช้งานปลั๊กไฟเพิ่ม 5 ตัว',
        status: 'pending',
        participants: 12,
        userId: studentUser.id,
        userName: studentUser.name,
        phone: '089-999-8888',
        email: studentUser.email,
        department: 'คณะเทคโนโลยีสารสนเทศ'
      },
      {
        roomId: 'r3',
        date: dayAfterTomorrow,
        startTime: '08:30',
        endTime: '11:30',
        topic: 'ประชุมคณาจารย์สำนักวิทยบริการประจำเดือน',
        notes: 'ประชุมระบบ Video Conference',
        status: 'approved',
        participants: 18,
        userId: staffUser.id,
        userName: staffUser.name,
        phone: '044-123456',
        email: staffUser.email,
        department: 'สำนักวิทยบริการฯ',
        reviewedBy: 'ผู้ดูแลระบบ (แอดมิน)',
        reviewedAt: new Date()
      }
    ]
  });

  // 4. Sample Problems
  console.log('🛠️ Seeding Problem Reports...');
  await prisma.problem.deleteMany({});
  await prisma.problem.create({
    data: {
      roomId: 'r1',
      problemType: 'อุปกรณ์ชำรุด',
      details: 'รีโมทแอร์กดติดยาก และปลั๊กไฟเสาข้างประตูใช้การไม่ได้ 1 ช่อง',
      urgency: 'medium',
      status: 'pending',
      reportedAt: new Date()
    }
  });

  console.log('✅ Full Demo Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
