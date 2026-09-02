import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn, ShieldCheck, Users, GraduationCap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleLogin } from '@react-oauth/google';

import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim().endsWith('@rmu.ac.th') && username.trim() !== 'nikkystaff@gmail.com') {
      setError('อีเมลไม่ถูกต้อง (ต้องเป็น @rmu.ac.th หรืออีเมลเจ้าหน้าที่)');
      return;
    }

    setLoading(true);

    await new Promise(r => setTimeout(r, 600)); // Simulate async

    const success = await login(username.trim(), password);
    setLoading(false);

    if (success) {
      setUsername(''); setPassword(''); setError('');
      onOpenChange(false);
      
      const savedUser = sessionStorage.getItem('arit_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        
        import('sweetalert2').then((Swal) => {
          Swal.default.fire({
            title: 'เข้าสู่ระบบสำเร็จ',
            text: `ยินดีต้อนรับคุณ ${user.name}`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false
          }).then(() => {
            if (user.role === 'admin') {
              navigate('/admin');
            } else if (user.role === 'staff') {
              navigate('/staff');
            }
          });
        });
      }
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };



  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setLoading(true);
      setError('');
      const { success, error: msg } = await loginWithGoogle(credentialResponse.credential);
      setLoading(false);
      
      if (success) {
        onOpenChange(false);
        const savedUser = sessionStorage.getItem('arit_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          import('sweetalert2').then((Swal) => {
            Swal.default.fire({
              title: 'เข้าสู่ระบบสำเร็จ',
              text: `ยินดีต้อนรับคุณ ${user.name}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              allowOutsideClick: false
            }).then(() => {
              if (user.role === 'admin') navigate('/admin');
              else if (user.role === 'staff') navigate('/staff');
            });
          });
        }
      } else {
        setError(msg || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-[95vw] sm:w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">เข้าสู่ระบบ</DialogTitle>
        <div className="relative rounded-3xl overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Vibrant colorful background */}
          <div className="absolute inset-0 bg-white/90" />
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/40 backdrop-blur-xl" />

          <div className="relative z-10 p-6 sm:p-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-5 flex justify-center items-center">
                <img
                  src="/ตรามหาลัย.png"
                  alt="มหาวิทยาลัยราชภัฎมหาสารคาม"
                  className="relative h-24 sm:h-28 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">เข้าสู่ระบบ</h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">ARIT E-ROOMs · ม.ราชภัฎมหาสารคาม</p>
            </div>



            {/* Google Sign In */}
            <div className="flex flex-col items-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google');
                }}
                theme="outline"
                shape="pill"
                text="signin_with"
                size="large"
                hosted_domain="rmu.ac.th"
              />
              <p className="text-sm text-slate-600 mt-3 font-semibold bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                🎓 สำหรับนักศึกษา (เฉพาะอีเมล @rmu.ac.th)
              </p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-slate-500 font-medium rounded-full">หรือเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-semibold ml-1">อีเมล (@rmu.ac.th เท่านั้น)</Label>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="เช่น student@rmu.ac.th"
                  className="bg-white/70 border-blue-100 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 h-11 text-sm transition-all shadow-sm"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-sm font-semibold ml-1">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/70 border-blue-100 text-slate-800 placeholder:text-slate-400 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 h-11 text-sm pr-10 transition-all shadow-sm"
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
                className="w-full h-11 rounded-xl font-bold text-white text-base shadow-lg shadow-blue-500/25 transition-all duration-300 mt-6 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
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
