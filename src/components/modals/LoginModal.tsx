import { useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn, AlertCircle, X } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/swal";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim().endsWith("@rmu.ac.th") && username.trim() !== "nikkystaff@gmail.com") {
      setError("อีเมลไม่ถูกต้อง (ต้องเป็น @rmu.ac.th หรืออีเมลเจ้าหน้าที่)");
      return;
    }

    setLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) {
        setUsername("");
        setPassword("");
        setError("");
        onOpenChange(false);

        const savedUser = sessionStorage.getItem("arit_user") || localStorage.getItem("arit_user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          showSuccess("เข้าสู่ระบบสำเร็จ", `ยินดีต้อนรับคุณ ${user.name}`);
          if (user.role === "admin") {
            navigate("/admin");
          } else if (user.role === "staff") {
            navigate("/staff");
          }
        }
      } else {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      closeOnOverlayClick={true}
      showCloseButton={false}
    >
      <div className="relative pt-1 pb-1 px-1">
        {/* Close Button X */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute -right-2 -top-2 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Logo */}
        <div className="flex flex-col items-center text-center mb-4">
          <img
            src="/university-logo.png"
            alt="ตรามหาวิทยาลัยราชภัฏมหาสารคาม"
            className="w-20 h-20 object-contain drop-shadow-md mb-2 transition-transform hover:scale-105"
          />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            เข้าสู่ระบบ
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            ARIT E-ROOMs · ม.ราชภัฏมหาสารคาม
          </p>

          {/* Google Sign-in pill button */}
          <div className="mt-4 flex flex-col items-center gap-2 w-full">
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={(credentialResponse: CredentialResponse) => {
                  if (credentialResponse.credential) {
                    setLoading(true);
                    loginWithGoogle(credentialResponse.credential)
                      .then((res) => {
                        setLoading(false);
                        if (res.success && res.user) {
                          onOpenChange(false);
                          showSuccess("เข้าสู่ระบบสำเร็จ", `ยินดีต้อนรับคุณ ${res.user.name}`);
                          if (res.user.role === "admin") navigate("/admin");
                          else if (res.user.role === "staff") navigate("/staff");
                        } else {
                          setError(res.error || "ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
                        }
                      })
                      .catch(() => {
                        setLoading(false);
                        setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
                      });
                  }
                }}
                onError={() => {
                  setError("เกิดข้อผิดพลาดในการเชื่อมต่อ Google OAuth");
                }}
                shape="pill"
                size="large"
                text="signin_with"
              />
            </div>

            {/* Student Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm mt-1">
              <span>🎓</span> สำหรับนักศึกษา (เฉพาะอีเมล @rmu.ac.th)
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            หรือเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              อีเมล (@rmu.ac.th เท่านั้น)
            </Label>
            <Input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@rmu.ac.th"
              required
              className="rounded-2xl bg-[#edf3ff] dark:bg-slate-800/90 border border-blue-100/60 dark:border-slate-700/60 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-400/20 h-12 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400/90 px-4 transition-all"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              รหัสผ่าน
            </Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="rounded-2xl bg-[#edf3ff] dark:bg-slate-800/90 border border-blue-100/60 dark:border-slate-700/60 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-400/20 h-12 text-sm font-medium text-slate-800 dark:text-slate-100 pl-4 pr-11 placeholder:text-slate-400/90 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white rounded-2xl font-bold h-12 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all text-base flex items-center justify-center gap-2 mt-3 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </div>
    </AppModal>
  );
};

