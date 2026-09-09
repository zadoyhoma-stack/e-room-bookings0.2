import { useState, useEffect } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User, Lock, Save, Camera } from "lucide-react";
import { showSuccess, showError, showWarning } from "@/utils/swal";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { currentUser, updateUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [nickname, setNickname] = useState(currentUser?.nickname || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && currentUser) {
      setNickname(currentUser.nickname || "");
      setIsSubmitting(false);
    }
  }, [open, currentUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showWarning("รูปภาพมีขนาดใหญ่เกินไป", "รูปภาพต้องมีขนาดไม่เกิน 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          await updateUser({ profilePic: base64String });
          showSuccess("อัปเดตรูปโปรไฟล์สำเร็จ");
        } catch (err: unknown) {
          showError("เกิดข้อผิดพลาดในการอัปเดตรูปโปรไฟล์");
        } finally {
          e.target.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateUser({ nickname });
      showSuccess("บันทึกชื่อเล่นสำเร็จ");
      onOpenChange(false);
    } catch (err: unknown) {
      showError("เกิดข้อผิดพลาดในการอัปเดตชื่อเล่น");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showWarning("รหัสผ่านไม่ตรงกัน", "รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ต้องตรงกัน");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      showSuccess("เปลี่ยนรหัสผ่านสำเร็จ (จำลอง)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const editCount = currentUser.lastProfileEditDate === todayStr ? currentUser.profileEditCount || 0 : 0;
  const remainingEdits = Math.max(0, 5 - editCount);

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      variant="info"
      icon={<User className="w-6 h-6" />}
      title="จัดการบัญชีผู้ใช้ (Profile & Account)"
      description="แก้ไขข้อมูลส่วนตัวและจัดการบัญชีของคุณ"
      showCloseButton
    >
      {/* Tab Selector */}
      {isAdmin && (
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "profile"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "password"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("password")}
          >
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      )}

      {activeTab === "profile" ? (
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md transition-all group-hover:border-indigo-500">
                {currentUser.profilePic ? (
                  <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <span className="text-[11px] text-slate-400 font-medium mt-1">คลิกที่รูปเพื่ออัปโหลดใหม่ (ไม่เกิน 2MB)</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                ชื่อเล่นที่แสดงในการจอง
              </Label>
              <div className="relative">
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 pl-10 rounded-xl h-11 text-sm font-medium"
                  placeholder="ใส่ชื่อเล่นของคุณ"
                  required
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {!isAdmin && (
                <p className="text-xs font-semibold text-amber-600 mt-1">
                  สิทธิ์คงเหลือแก้ไขวันนี้: {remainingEdits}/5 ครั้ง
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-400 mb-1.5 block">สิทธิ์การใช้งานระบบ</Label>
              <Input
                value={currentUser.role}
                disabled
                className="bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-xs font-bold uppercase text-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11 shadow-lg shadow-indigo-600/20"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูลส่วนตัว"}
            </Button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              รหัสผ่านปัจจุบัน
            </Label>
            <div className="relative">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 pl-10 rounded-xl h-11 text-sm font-medium"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              รหัสผ่านใหม่
            </Label>
            <div className="relative">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 pl-10 rounded-xl h-11 text-sm font-medium"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              ยืนยันรหัสผ่านใหม่
            </Label>
            <div className="relative">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 pl-10 rounded-xl h-11 text-sm font-medium"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11 shadow-lg shadow-indigo-600/20"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
          </Button>
        </form>
      )}
    </AppModal>
  );
};
