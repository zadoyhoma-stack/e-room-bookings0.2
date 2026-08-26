/**
 * ProfileModal.tsx
 * หน้าต่างจัดการโปรไฟล์ผู้ใช้ — มี 2 แท็บ (เฉพาะ admin):
 * 1. ข้อมูลส่วนตัว: แก้ไขชื่อเล่น, อัปโหลดรูปโปรไฟล์
 * 2. รหัสผ่าน: เปลี่ยนรหัสผ่าน (จำลอง)
 * สำหรับ staff/student แก้ได้แค่รูปและชื่อเล่นเท่านั้น
 */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User, Lock, Save, CheckCircle, Upload, Camera } from "lucide-react";

// ==================== Props ====================
interface ProfileModalProps {
  open: boolean;                        // เปิด/ปิด Modal
  onOpenChange: (open: boolean) => void; // ฟังก์ชันเปลี่ยนสถานะเปิด/ปิด
}

export const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  // ดึงข้อมูลผู้ใช้ปัจจุบัน + ฟังก์ชันอัปเดตจาก AuthContext
  const { currentUser, updateUser, isAdmin } = useAuth();

  // ==================== State จัดการแท็บและฟอร์ม ====================
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // ฟอร์มข้อมูลส่วนตัว
  const [nickname, setNickname] = useState(currentUser?.nickname || '');

  // ฟอร์มเปลี่ยนรหัสผ่าน
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ซิงค์ชื่อเล่นเมื่อเปิด Modal
  useEffect(() => {
    if (open && currentUser) {
      setNickname(currentUser.nickname || '');
    }
  }, [open, currentUser]);

  // ==================== ฟังก์ชันอัปโหลดรูปโปรไฟล์ ====================
  // อ่านไฟล์รูปภาพ → แปลงเป็น Base64 string → ส่งไปบันทึกที่ Backend
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ไม่เกิน 2MB
      if (file.size > 2 * 1024 * 1024) {
        alert('รูปภาพต้องมีขนาดไม่เกิน 2MB');
        return;
      }
      // ใช้ FileReader แปลงไฟล์เป็น Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          await updateUser({ profilePic: base64String });
          import('sweetalert2').then((Swal) => {
            Swal.default.fire({
              title: 'อัปเดตรูปโปรไฟล์สำเร็จ',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          });
        } catch (err: unknown) {
          import('sweetalert2').then((Swal) => {
            Swal.default.fire({
              title: 'เกิดข้อผิดพลาด',
              text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์',
              icon: 'error'
            });
          });
        } finally {
          e.target.value = ''; // รีเซ็ต input เพื่อให้เลือกไฟล์เดิม/ใหม่ซ้ำได้
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== ฟังก์ชันบันทึกข้อมูลส่วนตัว ====================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ nickname });
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          title: 'บันทึกชื่อเล่นสำเร็จ',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      });
      onOpenChange(false);
    } catch (err: unknown) {
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          title: 'เกิดข้อผิดพลาด',
          text: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตชื่อเล่น',
          icon: 'error'
        });
      });
    }
  };

  // ==================== ฟังก์ชันเปลี่ยนรหัสผ่าน (จำลอง) ====================
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // ตรวจสอบว่ารหัสผ่านใหม่ กับ ยืนยันรหัสผ่านใหม่ ตรงกันหรือไม่
    if (newPassword !== confirmPassword) {
      import('sweetalert2').then((Swal) => Swal.default.fire({ title: 'รหัสผ่านใหม่ไม่ตรงกัน', icon: 'warning' }));
      return;
    }
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'เปลี่ยนรหัสผ่านสำเร็จ (จำลอง)',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    });
    // เคลียร์ฟอร์ม
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  // ถ้ายังไม่ได้ล็อคอิน ไม่ต้องแสดงอะไร
  if (!currentUser) return null;

  // คำนวณสิทธิ์คงเหลือของวันนี้
  const todayStr = new Date().toISOString().split('T')[0];
  const editCount = currentUser.lastProfileEditDate === todayStr ? (currentUser.profileEditCount || 0) : 0;
  const remainingEdits = Math.max(0, 5 - editCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-2xl border-white/30 max-w-md">
        {/* ==================== ส่วนหัว Modal ==================== */}
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl text-card-foreground">จัดการบัญชีผู้ใช้</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลส่วนตัวหรือเปลี่ยนรหัสผ่านของคุณ</DialogDescription>
        </DialogHeader>

        {/* ==================== แท็บสลับ (ข้อมูลส่วนตัว / รหัสผ่าน) ==================== */}
        {isAdmin && (
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'profile' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('profile')}
            >
              ข้อมูลส่วนตัว
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'password' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('password')}
            >
              รหัสผ่าน
            </button>
          </div>
        )}

        {/* ==================== แท็บข้อมูลส่วนตัว ==================== */}
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {/* ส่วนแสดงรูปโปรไฟล์ + ปุ่มอัปโหลด */}
            <div className="flex flex-col items-center gap-3">
              <label className="relative group cursor-pointer">
                {/* วงกลมรูปโปรไฟล์ */}
                <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-slate-200 flex items-center justify-center shadow-lg transition-all group-hover:border-primary/50">
                  {currentUser.profilePic ? (
                    <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                  
                  {/* Overlay ตอนเอาเมาส์ชี้ */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            {/* ฟอร์มแก้ไขชื่อเล่น */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* ช่องชื่อเล่น */}
              <div className="space-y-1.5">
                <Label className="text-slate-600">ชื่อเล่น</Label>
                <div className="relative">
                  <Input
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="bg-white border-slate-200 pl-9 text-slate-800"
                    placeholder="ใส่ชื่อเล่นของคุณ"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">ชื่อเล่นจะแสดงเมื่อคุณจองห้อง</p>
                  {!isAdmin && (
                    <p className={`text-xs font-medium ${remainingEdits > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                      เหลือสิทธิ์วันนี้: {remainingEdits}/5 ครั้ง
                    </p>
                  )}
                </div>
              </div>
              {/* ช่องแสดงสิทธิ์ (แก้ไขไม่ได้) */}
              <div className="space-y-1.5">
                <Label className="text-slate-400">สิทธิ์การใช้งาน (แก้ไขไม่ได้)</Label>
                <Input value={currentUser.role} disabled className="bg-slate-50 border-slate-100 text-slate-400 uppercase" />
              </div>

              <Button type="submit" className="w-full mt-2">
                <Save className="h-4 w-4 mr-2" /> บันทึกข้อมูล
              </Button>
            </form>
          </div>
        ) : (
          isAdmin ? (
            /* ==================== แท็บเปลี่ยนรหัสผ่าน ==================== */
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* ช่องรหัสผ่านปัจจุบัน */}
              <div className="space-y-1.5">
                <Label className="text-slate-600">รหัสผ่านปัจจุบัน</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="bg-white border-slate-200 pl-9 text-slate-800"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              {/* ช่องรหัสผ่านใหม่ */}
              <div className="space-y-1.5">
                <Label className="text-slate-600">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-white border-slate-200 pl-9 text-slate-800"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              {/* ช่องยืนยันรหัสผ่านใหม่ */}
              <div className="space-y-1.5">
                <Label className="text-slate-600">ยืนยันรหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="bg-white border-slate-200 pl-9 text-slate-800"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2">
                <Save className="h-4 w-4 mr-2" /> เปลี่ยนรหัสผ่าน
              </Button>
            </form>
          ) : null
        )}
      </DialogContent>
    </Dialog>
  );
};
