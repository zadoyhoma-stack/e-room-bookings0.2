const fs = require('fs');

const data = JSON.parse(fs.readFileSync('database.json', 'utf8'));

const rooms = [
  { id: "r1", name: "ห้องประชุมสำนักงาน", capacity: 10, type: "ห้องประชุม", location: "ชั้น 1", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", status: "available" },
  { id: "r2", name: "ห้องประชุมอาเซียน", capacity: 15, type: "ห้องประชุม", location: "ชั้น 1", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80", status: "available" },
  { id: "r3", name: "ห้องกลุ่มย่อย ชั้น 2: ข้างบันได #1", capacity: 4, type: "พื้นที่ทำงานร่วม", location: "ชั้น 2", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80", status: "occupied" },
  { id: "r4", name: "ห้องกลุ่มย่อย ชั้น 2: ข้างบันได #2", capacity: 4, type: "พื้นที่ทำงานร่วม", location: "ชั้น 2", image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&q=80", status: "almost_full" },
  { id: "r5", name: "ห้องกลุ่มย่อย ชั้น 3: ข้างบันได #1", capacity: 4, type: "พื้นที่ทำงานร่วม", location: "ชั้น 3", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80", status: "available" },
  { id: "r6", name: "ห้องกลุ่มย่อย ชั้น 3: ข้างบันได #2", capacity: 4, type: "พื้นที่ทำงานร่วม", location: "ชั้น 3", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80", status: "available" },
  { id: "r7", name: "ห้องศึกษากลุ่ม ชั้น 4 : Study Room 1", capacity: 6, type: "ห้องศึกษาด้วยตัวเอง", location: "ชั้น 4", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80", status: "available" },
  { id: "r8", name: "ห้องศึกษากลุ่ม ชั้น 4 : Study Room 2", capacity: 6, type: "ห้องศึกษาด้วยตัวเอง", location: "ชั้น 4", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80", status: "available" },
  { id: "r9", name: "ห้องปฏิบัติการคอมพิวเตอร์ ชั้น 4", capacity: 30, type: "ห้องปฏิบัติการคอมพิวเตอร์", location: "ชั้น 4", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80", status: "available" },
  { id: "r10", name: "ห้องประชุม ชั้น 4 (24 ที่นั่ง)", capacity: 24, type: "ห้องประชุม", location: "ชั้น 4", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", status: "available" },
  { id: "r11", name: "ห้องศึกษากลุ่ม ชั้น 4 : Study Room 3", capacity: 6, type: "ห้องศึกษาด้วยตัวเอง", location: "ชั้น 4", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80", status: "available" },
  { id: "r12", name: "ห้องกลุ่มย่อย ชั้น 4: ข้างบันได", capacity: 4, type: "พื้นที่ทำงานร่วม", location: "ชั้น 4", image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&q=80", status: "available" },
  { id: "r13", name: "ห้องเรียน ชั้น 5", capacity: 30, type: "ห้องเรียน", location: "ชั้น 5", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80", status: "available" },
  { id: "r14", name: "ห้องสอนออนไลน์ (สำหรับผู้สอน)", capacity: 2, type: "ห้องศึกษาด้วยตัวเอง", location: "ชั้น 5", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80", status: "available" },
  { id: "r15", name: "ห้องประชุม ชั้น 6", capacity: 80, type: "ห้องฝึกอบรม", location: "ชั้น 6", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", status: "available" }
];

data.rooms = rooms;

fs.writeFileSync('database.json', JSON.stringify(data, null, 2));
console.log('Successfully updated database.json');
