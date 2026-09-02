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
  profileEditCount?: number;
  lastProfileEditDate?: string;
}

interface AuthContextType {
  currentUser: AppUser | null;  // ผู้ใช้ที่ล็อคอินอยู่ (null = ยังไม่ล็อคอิน)
  login: (username: string, password: string) => Promise<boolean>;  // ฟังก์ชันเข้าสู่ระบบ
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>; // ล็อคอินด้วย Google
  logout: () => void;           // ฟังก์ชันออกจากระบบ
  isAdmin: boolean;             // เป็นผู้ดูแลระบบหรือไม่
  isStaff: boolean;             // เป็นเจ้าหน้าที่หรือไม่
  isStudent: boolean;           // เป็นนักศึกษาหรือไม่
  canApprove: boolean;          // สามารถอนุมัติ/ปฏิเสธการจองได้หรือไม่
  canViewStats: boolean;        // สามารถดูรายงานสถิติได้หรือไม่
  canManageSystem: boolean;     // สามารถจัดการระบบ (เพิ่ม/ลบ ผู้ใช้) ได้หรือไม่
  updateUser: (updates: Partial<AppUser>) => Promise<void>;  // ฟังก์ชันอัปเดตข้อมูลผู้ใช้
}

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

const API_BASE_URL = 'https://e-room-bookings0-2-1.onrender.com';

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        sessionStorage.setItem('arit_user', JSON.stringify(data.user));
        sessionStorage.setItem('arit_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (credential: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(API_BASE_URL + '/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        sessionStorage.setItem('arit_user', JSON.stringify(data.user));
        sessionStorage.setItem('arit_token', data.token);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'การเข้าสู่ระบบผิดพลาด' };
      }
    } catch (error) {
      console.error('Google Login error:', error);
      return { success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' };
    }
  };



  // ==================== ฟังก์ชันออกจากระบบ ====================
  const logout = () => {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'ยืนยันการออกจากระบบ?',
        text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'ออกจากระบบ',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          setCurrentUser(null);
          sessionStorage.removeItem('arit_user');
          sessionStorage.removeItem('arit_token');
          window.location.href = '/';
        }
      });
    });
  };

  // ==================== ฟังก์ชันอัปเดตข้อมูลผู้ใช้ ====================
  // ใช้สำหรับแก้ชื่อ, อีเมล, รูปโปรไฟล์
  // อัปเดตทั้ง state ใน React + sessionStorage + ส่งไป Backend
  const updateUser = async (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    
    try {
      // ส่งข้อมูลไปอัปเดตที่ Backend
      const token = sessionStorage.getItem('arit_token');
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // ถ้า server ส่ง error กลับมา (เช่น rate limit) ให้ throw
        if (errData.error) throw new Error(errData.error);
      }
      
      const updatedUserFromServer = await res.json();
      const updated = { ...currentUser, ...updatedUserFromServer };
      setCurrentUser(updated);
      sessionStorage.setItem('arit_user', JSON.stringify(updated));
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
      
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      sessionStorage.setItem('arit_user', JSON.stringify(updated));
      throw err;
    }
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
      loginWithGoogle,
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

