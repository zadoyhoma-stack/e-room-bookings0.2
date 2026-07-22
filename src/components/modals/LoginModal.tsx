import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn, ShieldCheck, Users, GraduationCap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_HINTS = [
  { label: 'Admin', user: 'admin', pass: 'admin1234', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50', hover: 'hover:bg-violet-100 hover:border-violet-300', border: 'border-violet-200' },
  { label: 'เจ้าหน้าที่', user: 'staff01', pass: 'staff1234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-100 hover:border-blue-300', border: 'border-blue-200' },
  { label: 'นักศึกษา', user: 'student01', pass: 'std1234', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100 hover:border-emerald-300', border: 'border-emerald-200' },
];

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600)); // Simulate async

    const success = login(username.trim(), password);
    setLoading(false);

    if (success) {
      setUsername(''); setPassword(''); setError('');
      onOpenChange(false);
      
      const savedUser = sessionStorage.getItem('arit_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'staff') {
          navigate('/staff');
        }
      }
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const fillHint = (user: string, pass: string) => {
    setUsername(user); setPassword(pass); setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-[500px] overflow-hidden !top-[40%] !translate-y-[-45%]">
        <DialogTitle className="sr-only">เข้าสู่ระบบ</DialogTitle>
        <div className="relative rounded-3xl overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Vibrant colorful background */}
          <div className="absolute inset-0 bg-white/90" />
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/40 backdrop-blur-xl" />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5 flex justify-center items-center">
                <img
                  src="/ตรามหาลัย.png"
                  alt="มหาวิทยาลัยราชภัฎมหาสารคาม"
                  className="relative h-24 sm:h-28 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">เข้าสู่ระบบ</h2>
              <p className="text-base text-slate-500 mt-2 font-medium">ARIT E-ROOMs · ม.ราชภัฎมหาสารคาม</p>
            </div>

            {/* Quick-fill role hints */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {ROLE_HINTS.map(h => (
                <button
                  key={h.user}
                  type="button"
                  onClick={() => fillHint(h.user, h.pass)}
                  className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 group shadow-sm hover:shadow-md", h.bg, h.border, h.hover)}
                >
                  <h.icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", h.color)} />
                  <span className={cn("text-[13px] font-bold transition-colors", h.color)}>{h.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-base font-semibold ml-1">ชื่อผู้ใช้</Label>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="เช่น admin, staff01, student01"
                  className="bg-white/70 border-blue-100 text-slate-800 placeholder:text-slate-400 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 h-14 text-base transition-all shadow-sm"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-base font-semibold ml-1">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/70 border-blue-100 text-slate-800 placeholder:text-slate-400 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 h-14 text-base pr-12 transition-all shadow-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full h-14 rounded-2xl font-bold text-white text-lg shadow-lg shadow-blue-500/25 transition-all duration-300 mt-8 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    กำลังตรวจสอบ...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-base">
                    <LogIn className="h-5 w-5" />
                    เข้าสู่ระบบ
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
