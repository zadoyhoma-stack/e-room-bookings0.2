import { useState } from "react";
import { Bell, User, LogOut, ShieldCheck, Users, GraduationCap, ChevronDown, Star, AlertTriangle, Moon, Sun, Inbox } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onLoginClick: () => void;
  onProfileClick: () => void;
  onEvaluateClick: () => void;
  onReportClick: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const ROLE_CONFIG: Record<UserRole, { label: string; icon: typeof ShieldCheck; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-100 border-violet-200' },
  staff: { label: 'เจ้าหน้าที่', icon: Users, color: 'text-sky-500', bg: 'bg-sky-100 border-sky-200' },
  student: { label: 'นักศึกษา', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-100 border-emerald-200' },
};

export const DashboardHeader = ({ onLoginClick, onProfileClick, onEvaluateClick, onReportClick, selectedDate, onDateSelect }: DashboardHeaderProps) => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const roleConfig = currentUser ? ROLE_CONFIG[currentUser.role] : null;
  const RoleIcon = roleConfig?.icon ?? User;
  const displayName = currentUser?.role === 'admin' ? currentUser.name : (currentUser?.nickname || currentUser?.name);

  return (
    <div className="flex flex-col gap-6 mb-8 mt-2 relative z-50">
      
      {/* Top Banner */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2 sm:p-4 group">

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative shrink-0 flex items-center justify-center w-[64px] h-[64px] sm:w-[112px] sm:h-[112px] hover:scale-105 transition-transform duration-300">
              <img src="/ตรามหาลัย.png" alt="Logo" className="w-full h-full object-contain drop-shadow-xl" />
            </div>
            <div className="flex flex-col justify-center ml-1 sm:ml-2 min-w-0">
              <span className="text-[20px] sm:text-[28px] leading-tight font-black tracking-tight text-white drop-shadow-md truncate">
                ARIT E-ROOMs
              </span>
              <span className="text-[10px] sm:text-[14px] text-white/90 font-medium tracking-wide mt-0.5 drop-shadow-md truncate">
                มหาวิทยาลัยราชภัฏมหาสารคาม
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
            
            {/* Top Row (Theme + Profile) */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto z-50">
              
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 sm:px-3 sm:py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full sm:rounded-[18px] transition-all flex items-center gap-1.5 border border-white/10 shadow-sm"
                title="สลับโหมดหน้าจอ"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="hidden sm:inline-block font-semibold">
                  {theme === 'dark' ? 'สว่าง' : 'มืด'}
                </span>
              </button>

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-[20px] bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all duration-300 border border-white/10 shadow-sm"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0">
                      {currentUser.profilePic ? (
                        <img src={currentUser.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-[#1877f2]" />
                      )}
                    </div>
                    <div className={cn("hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold", roleConfig?.bg, roleConfig?.color)}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleConfig?.label}
                    </div>
                    <span className="text-sm font-semibold max-w-[120px] sm:max-w-[150px] truncate hidden xs:inline-block">{displayName}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", dropdownOpen && "rotate-180")} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#242526] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
                          <p className="text-sm font-semibold text-[#050505] dark:text-[#e4e6eb] truncate">{displayName}</p>
                          <p className="text-xs text-[#65676b] dark:text-[#b0b3b8] truncate">{currentUser.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <button onClick={() => { setDropdownOpen(false); onProfileClick(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg transition-colors">
                            <User className="h-4 w-4 text-[#65676b] dark:text-[#b0b3b8]" /> แก้ไขโปรไฟล์
                          </button>
                          {currentUser.role === 'student' && (
                            <button onClick={() => { setDropdownOpen(false); navigate('/my-bookings'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#050505] dark:text-[#e4e6eb] hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c] rounded-lg transition-colors">
                              <Inbox className="h-4 w-4 text-[#65676b] dark:text-[#b0b3b8]" /> การจองของฉัน
                            </button>
                          )}
                          {currentUser.role === 'admin' && (
                            <Link to="/admin" onClick={() => setDropdownOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-[#e7f3ff] rounded-lg transition-colors">
                              <ShieldCheck className="h-4 w-4" /> ระบบจัดการ (Back Office)
                            </Link>
                          )}
                          {currentUser.role === 'staff' && (
                            <Link to="/staff" onClick={() => setDropdownOpen(false)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                              <Users className="h-4 w-4" /> ระบบจัดการ (Staff)
                            </Link>
                          )}
                          <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4" /> ออกจากระบบ
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={onLoginClick} 
                  className="rounded-full sm:rounded-[18px] px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-[#1877f2] hover:bg-slate-100 transition-all duration-300 font-bold text-sm h-auto shadow-sm"
                >
                  <User className="mr-1.5 h-4 w-4" />
                  เข้าสู่ระบบ
                </Button>
              )}
            </div>

            {/* Utility Actions Group (Bottom Row on Mobile) */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-[18px] sm:rounded-[20px] p-1 overflow-x-auto no-scrollbar max-w-full sm:order-first z-40 border border-white/10 shadow-sm">
              {currentUser?.role === 'student' && (
                <>
                  <button 
                    onClick={() => navigate('/my-bookings')} 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-[14px] transition-all whitespace-nowrap"
                  >
                    <Inbox className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>สถานะการจอง</span>
                  </button>
                  <div className="w-[1px] h-3.5 bg-white/30 mx-0.5"></div>
                </>
              )}
              <button 
                onClick={onEvaluateClick} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-[14px] transition-all whitespace-nowrap"
              >
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>แบบประเมิน</span>
              </button>
              <div className="w-[1px] h-3.5 bg-white/30 mx-0.5"></div>
              <button 
                onClick={onReportClick} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-sm font-semibold text-amber-100 hover:text-white hover:bg-amber-500/30 rounded-[14px] transition-all whitespace-nowrap"
              >
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>แจ้งปัญหา</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
