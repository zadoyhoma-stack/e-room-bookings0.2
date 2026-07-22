export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
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
    equipment: ['wifi', 'projector', 'tv'], status: 'available', location: 'ชั้น 2',
    description: 'ห้องประชุมสำหรับผู้บริหาร', rules: ['ห้ามนำอาหารเข้าห้อง', 'ห้ามส่งเสียงดัง'],
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
