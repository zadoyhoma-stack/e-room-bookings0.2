export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type ProblemStatus = 'pending' | 'resolved';
export type ProblemUrgency = 'low' | 'medium' | 'high';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
  location: string;
  description: string;
  rules: string[];
  occupiedText?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  notes: string;
  status: BookingStatus;
  participants: number;
  userId?: string;
  userName?: string;
  phone?: string;
  email?: string;
  department?: string;
  participantList?: string[];
  extraEquipment?: string;
  ipAddress?: string;
}

export interface Problem {
  id: string;
  roomId: string;
  problemType: string;
  details: string;
  image?: string;
  urgency: ProblemUrgency;
  rating?: number;
  status: ProblemStatus;
  reportedAt: string;
}

export interface Evaluation {
  id: string;
  rating: number;
  feedback: string;
  submittedAt: string;
}

export interface TimeSlot {
  time: string;
  status: 'available' | 'booked';
  bookingInfo?: string;
}

export const EQUIPMENT_LABELS: Record<string, string> = {
  projector: 'โปรเจคเตอร์',
  microphone: 'ไมโครโฟน',
  tv: 'ทีวี/จอ',
  powerstrip: 'ปลั๊กพ่วง',
  wifi: 'Wi-Fi',
  whiteboard: 'ไวท์บอร์ด',
  videoconf: 'ระบบประชุมทางไกล',
};

export const STATUS_LABELS: Record<string, string> = {
  available: 'ว่าง',
  occupied: 'ไม่ว่าง',
  maintenance: 'ปิดปรับปรุง',
  pending: 'รออนุมัติ',
  approved: 'อนุมัติ',
  rejected: 'ปฏิเสธ',
  cancelled: 'ยกเลิก',
};

export const mockRooms: Room[] = [
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

export const TIME_OPTIONS = [
  '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export const PARTICIPANT_OPTIONS = [2, 4, 6, 8, 10, 15, 20, 30, 40, 50, 60, 80, 100];

export const generateTodaySlots = (roomId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
  const seed = roomId.charCodeAt(1);
  hours.forEach((time, i) => {
    const isBooked = (seed + i) % 3 === 0;
    slots.push({
      time,
      status: isBooked ? 'booked' : 'available',
      bookingInfo: isBooked ? 'ประชุมภายใน' : undefined,
    });
  });
  return slots;
};
