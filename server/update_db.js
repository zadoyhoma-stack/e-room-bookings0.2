import fs from 'fs';

const DB_PATH = './database.json';

const newRooms = [
  {
    id: 'r1', name: 'ห้องประชุมสำนักงาน', capacity: 10,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 1',
    description: 'ห้องประชุม', rules: ['ห้ามนำอาหารเข้าห้อง'],
  },
  {
    id: 'r2', name: 'ห้องประชุมอาเซียน', capacity: 15,
    equipment: ['wifi', 'projector'], status: 'available', location: 'ชั้น 1',
    description: 'ห้องประชุม', rules: ['ห้ามนำอาหารเข้าห้อง'],
  },
  {
    id: 'r3', name: 'ห้องกลุ่มย่อย ชั้น 2: ข้างบันได #1', capacity: 4,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 2',
    description: 'พื้นที่ทำงานร่วม', rules: [],
  },
  {
    id: 'r4', name: 'ห้องกลุ่มย่อย ชั้น 2: ข้างบันได #2', capacity: 4,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 2',
    description: 'พื้นที่ทำงานร่วม', rules: [],
  },
  {
    id: 'r5', name: 'ห้องศึกษากลุ่ม ชั้น 4 : Study Room 1', capacity: 6,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 4',
    description: 'ห้องศึกษาด้วยตัวเอง', rules: [],
  },
  {
    id: 'r6', name: 'ห้องศึกษากลุ่ม ชั้น 4 : Study Room 2', capacity: 6,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 4',
    description: 'ห้องศึกษาด้วยตัวเอง', rules: [],
  },
  {
    id: 'r7', name: 'ห้องปฏิบัติการคอมพิวเตอร์ ชั้น 4 (30 ที่นั่ง)', capacity: 30,
    equipment: ['wifi', 'projector'], status: 'available', location: 'ชั้น 4',
    description: 'ห้องปฏิบัติการคอมพิวเตอร์', rules: ['ห้ามนำอาหารเข้าห้อง'],
  },
  {
    id: 'r8', name: 'ห้องประชุม ชั้น 4 (24 ที่นั่ง)', capacity: 24,
    equipment: ['wifi', 'projector', 'microphone'], status: 'available', location: 'ชั้น 4',
    description: 'ห้องประชุม', rules: ['ห้ามนำอาหารเข้าห้อง'],
  },
  {
    id: 'r9', name: 'ห้องศึกษากลุ่ม ชั้น 4 : Study Room 3', capacity: 6,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 4',
    description: 'ห้องศึกษาด้วยตัวเอง', rules: [],
  },
  {
    id: 'r10', name: 'ห้องกลุ่มย่อย ชั้น 4: ข้างบันได (ห้องค้นคว้า 1)', capacity: 4,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 4',
    description: 'พื้นที่ทำงานร่วม', rules: [],
  },
  {
    id: 'r11', name: 'ห้องเรียน ชั้น 5', capacity: 30,
    equipment: ['wifi', 'projector'], status: 'available', location: 'ชั้น 5',
    description: 'ห้องเรียน', rules: ['ห้ามนำอาหารเข้าห้อง'],
  },
  {
    id: 'r12', name: 'ห้องสอนออนไลน์ (สำหรับผู้สอน)', capacity: 2,
    equipment: ['wifi', 'projector', 'microphone'], status: 'available', location: 'ชั้น 5',
    description: 'ห้องศึกษาด้วยตัวเอง', rules: [],
  },
  {
    id: 'r13', name: 'ห้องประชุม ชั้น 6', capacity: 80,
    equipment: ['wifi', 'projector', 'microphone', 'tv'], status: 'available', location: 'ชั้น 6',
    description: 'ห้องฝึกอบรม', rules: ['ห้ามนำอาหารเข้าห้อง'],
  },
  {
    id: 'r14', name: 'ห้องกลุ่มย่อย ชั้น 3: ข้างบันได #1', capacity: 4,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 3',
    description: 'พื้นที่ทำงานร่วม', rules: [],
  },
  {
    id: 'r15', name: 'ห้องกลุ่มย่อย ชั้น 3: ข้างบันได #2', capacity: 4,
    equipment: ['wifi'], status: 'available', location: 'ชั้น 3',
    description: 'พื้นที่ทำงานร่วม', rules: [],
  },
];

const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
data.rooms = newRooms;
fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('Database updated successfully.');
