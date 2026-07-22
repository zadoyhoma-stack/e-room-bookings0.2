/**
 * AuthContext.tsx
 * ระบบจัดการการยืนยันตัวตน (Authentication) และการแบ่งสิทธิ์ (Authorization)
 * - จัดการ Login / Logout
 * - แบ่งสิทธิ์ผู้ใช้ 3 ระดับ: admin, staff, student
 * - เก็บ session ไว้ใน sessionStorage เพื่อให้คงอยู่แม้รีเฟรชหน้า
 * - รองรับการอัปเดตข้อมูลส่วนตัว (ชื่อ, อีเมล, รูปโปรไฟล์)
 */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ==================== กำหนดประเภทข้อมูล (Types) ====================

/** สิทธิ์ผู้ใช้ 3 ระดับ */
export type UserRole = 'admin' | 'staff' | 'student';

/** โครงสร้างข้อมูลผู้ใช้งาน */
export interface AppUser {
  id: string;            // รหัสผู้ใช้ (เช่น u1, u2, u3)
  name: string;          // ชื่อ-นามสกุล
  nickname?: string;     // ชื่อเล่น (แสดงตอนจองห้อง)
  email: string;         // อีเมล
  role: UserRole;        // สิทธิ์การใช้งาน
  department?: string;   // หน่วยงาน (สำหรับ admin/staff)
  studentId?: string;    // รหัสนักศึกษา (สำหรับ student)
  profilePic?: string;   // รูปโปรไฟล์ (เก็บเป็น Base64 string)
}

/** โครงสร้างของ Context ที่ส่งให้ Component ลูกใช้ */
interface AuthContextType {
  setRole: (role: UserRole) => void;
  currentUser: AppUser | null;  // ผู้ใช้ที่ล็อคอินอยู่ (null = ยังไม่ล็อคอิน)
  login: (username: string, password: string) => Promise<boolean>;  // ฟังก์ชันเข้าสู่ระบบ
  logout: () => void;           // ฟังก์ชันออกจากระบบ
  isAdmin: boolean;             // เป็นผู้ดูแลระบบหรือไม่
  isStaff: boolean;             // เป็นเจ้าหน้าที่หรือไม่
  isStudent: boolean;           // เป็นนักศึกษาหรือไม่
  canApprove: boolean;          // สามารถอนุมัติ/ปฏิเสธการจองได้หรือไม่
  canViewStats: boolean;        // สามารถดูรายงานสถิติได้หรือไม่
  canManageSystem: boolean;     // สามารถจัดการระบบ (เพิ่ม/ลบ ผู้ใช้) ได้หรือไม่
  updateUser: (updates: Partial<AppUser>) => Promise<void>;  // ฟังก์ชันอัปเดตข้อมูลผู้ใช้
}

// ==================== ข้อมูลผู้ใช้จำลอง (Mock Users) ====================
// หมายเหตุ: ในระบบจริงจะดึงข้อมูลจาก Database แทน
const MOCK_USERS: Array<AppUser & { password: string }> = [
  {
    id: 'u1',
    name: 'ผู้ดูแลระบบ',
    nickname: 'แอดมิน',
    email: 'admin@rmu.ac.th',
    role: 'admin',
    department: 'สำนักวิทยบริการฯ',
    password: 'admin1234',
  },
  {
    id: 'u2',
    name: 'สมใจ รักงาน',
    nickname: 'ใจ',
    email: 'staff01@rmu.ac.th',
    role: 'staff',
    department: 'สำนักวิทยบริการฯ',
    password: 'staff1234',
  },
  {
    id: 'u3',
    name: 'นายมานะ ขยันเรียน',
    nickname: 'มานะ',
    email: 'student01@rmu.ac.th',
    role: 'student',
    studentId: '6501234567',
    password: 'std1234',
  },
  {
    id: 'u4',
    name: 'นางสาวสุดา ใจดี',
    nickname: 'สุดา',
    email: 'student02@rmu.ac.th',
    role: 'student',
    studentId: '6501234568',
    password: 'std1234',
  },
  {
    id: 'u5',
    name: 'นักศึกษา ทดสอบ2',
    nickname: 'นักศึกษา2',
    email: 'student2@rmu.ac.th',
    role: 'student',
    studentId: '2222222222',
    password: '222',
  },
];

const USERNAME_MAP: Record<string, string> = {
  admin: 'u1',
  staff01: 'u2',
  student01: 'u3',
  student02: 'u4',
  student2: 'u5',
  นักศึกษา2: 'u5',
};

// ==================== สร้าง Context ====================
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * AuthProvider - ครอบ Component ทั้งแอปเพื่อให้ทุก Component เข้าถึงข้อมูลผู้ใช้ได้
 * ใช้ใน main.tsx: <AuthProvider><App /></AuthProvider>
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // ==================== กู้คืน Session ====================
  // เมื่อเปิดหน้าเว็บครั้งแรก ตรวจสอบว่ามี session เก่าอยู่ไหม
  // ถ้ามี → ดึงข้อมูลมาใช้ต่อ (ไม่ต้อง Login ใหม่)
  useEffect(() => {
    const saved = sessionStorage.getItem('arit_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem('arit_user');
      }
    }
  }, []);

  // ==================== ฟังก์ชันเข้าสู่ระบบ ====================
  // ตรวจสอบชื่อผู้ใช้และรหัสผ่าน → ถ้าถูกต้องดึงข้อมูลจาก Backend ล่าสุด → return true
  const login = async (username: string, password: string): Promise<boolean> => {
    const userId = USERNAME_MAP[username.trim()];
    if (!userId) return false; // ไม่พบชื่อผู้ใช้

    const mockUser = MOCK_USERS.find(u => u.id === userId && u.password === password);
    if (!mockUser) return false; // รหัสผ่านไม่ถูกต้อง

    try {
      // ไปดึงข้อมูลล่าสุดจาก Backend
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json() as AppUser[];
        const dbUser = users.find(u => u.id === userId);
        if (dbUser) {
          setCurrentUser(dbUser);
          sessionStorage.setItem('arit_user', JSON.stringify(dbUser));
          return true;
        }
      }
    } catch {
      // Try localStorage fallback
      try {
        const localUsers = JSON.parse(localStorage.getItem('arit_users') || '[]');
        const localUser = localUsers.find((u: any) => u.id === userId);
        if (localUser) {
          setCurrentUser(localUser);
          sessionStorage.setItem('arit_user', JSON.stringify(localUser));
          return true;
        }
      } catch { /* ignore */ }
    }

    // ถ้าดึงไม่ได้ ให้ใช้ข้อมูลจาก mock
    const { password: _, ...appUser } = mockUser;
    setCurrentUser(appUser);
    sessionStorage.setItem('arit_user', JSON.stringify(appUser));
    return true;
  };

  const setRole = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (!user) return;

    const { password: _, ...appUser } = user;
    setCurrentUser(appUser);
    sessionStorage.setItem('arit_user', JSON.stringify(appUser));
  };

  // ==================== ฟังก์ชันออกจากระบบ ====================
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('arit_user');
  };

  // ==================== ฟังก์ชันอัปเดตข้อมูลผู้ใช้ ====================
  // ใช้สำหรับแก้ชื่อ, อีเมล, รูปโปรไฟล์
  // อัปเดตทั้ง state ใน React + sessionStorage + ส่งไป Backend
  const updateUser = async (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    
    try {
      // ส่งข้อมูลไปอัปเดตที่ Backend
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // ถ้า server ส่ง error กลับมา (เช่น rate limit) ให้ throw
        if (errData.error) throw new Error(errData.error);
      }
    } catch (err: any) {
      // ถ้า error มาจาก server response (rate limit etc) ให้ throw ต่อ
      if (err?.message && !err.message.includes('fetch')) throw err;
      // ถ้า error มาจาก network → ทำ fallback ลง localStorage
      try {
        const users = JSON.parse(localStorage.getItem('arit_users') || '[]');
        const idx = users.findIndex((u: any) => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updates };
          localStorage.setItem('arit_users', JSON.stringify(users));
        }
      } catch { /* ignore */ }
    }

    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    sessionStorage.setItem('arit_user', JSON.stringify(updated));
  };

  // ==================== คำนวณสิทธิ์การเข้าถึง ====================
  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff';
  const isStudent = currentUser?.role === 'student';
  const canApprove = isAdmin || isStaff;        // admin + staff อนุมัติได้
  const canViewStats = isAdmin || isStaff;       // admin + staff ดูสถิติได้
  const canManageSystem = isAdmin;               // เฉพาะ admin จัดการระบบได้

  // ==================== ส่ง Context ให้ Component ลูก ====================
  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      setRole,
      logout,
      isAdmin,
      isStaff,
      isStudent,
      canApprove,
      canViewStats,
      canManageSystem,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth() - Hook สำหรับเรียกใช้ข้อมูลผู้ใช้ในทุก Component
 * ตัวอย่าง: const { currentUser, isAdmin, login, logout } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/** ดึงรายชื่อผู้ใช้ทั้งหมด (ไม่รวมรหัสผ่าน) สำหรับหน้าจัดการผู้ใช้ */
export const getMockUsers = (): AppUser[] =>
  MOCK_USERS.map(({ password: _, ...u }) => u);
