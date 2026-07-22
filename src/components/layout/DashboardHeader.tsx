import { useState } from "react";
import { Bell, User, LogOut, ShieldCheck, Users, GraduationCap, ChevronDown, Star, AlertTriangle, Moon, Sun, Inbox } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
    <div className="flex flex-col gap-6 mb-8 mt-2">
      
      {/* Top Banner */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2 sm:p-4 group">

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative shrink-0 flex items-center justify-center w-[48px] h-[48px] sm:w-[96px] sm:h-[96px] hover:scale-105 transition-transform duration-300">
              <img src="/ตรามหาลัย.png" alt="Logo" className="w-full h-full object-contain drop-shadow-xl" />
            </div>
            <div className="flex flex-col justify-center ml-1 sm:ml-2 min-w-0">
              <span className="text-[20px] sm:text-[36px] leading-tight font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 drop-shadow-lg truncate" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                ARIT E-ROOMs
              </span>
              <span className="text-[10px] sm:text-[17px] text-white/95 font-medium tracking-wide drop-shadow-md mt-0.5 truncate">
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
                className="p-2 sm:px-3 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
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
                    className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg overflow-hidden bg-white/50 flex items-center justify-center shrink-0 border border-white/60 shadow-sm">
                      {currentUser.profilePic ? (
                        <img src={currentUser.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-800" />
                      )}
                    </div>
                    <div className={cn("hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold shadow-sm", roleConfig?.bg, roleConfig?.color, "border-white/50")}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleConfig?.label}
                    </div>
                    <span className="text-sm text-white font-semibold max-w-[120px] sm:max-w-[150px] truncate drop-shadow-md hidden xs:inline-block">{displayName}</span>
                    <ChevronDown className={cn("h-4 w-4 text-white/90 transition-transform duration-300", dropdownOpen && "rotate-180")} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/80 backdrop-blur-sm">
                          <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <button onClick={() => { setDropdownOpen(false); onProfileClick(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                            <User className="h-4 w-4 text-slate-400" /> แก้ไขโปรไฟล์
                          </button>
                          {currentUser.role === 'student' && (
                            <button onClick={() => { setDropdownOpen(false); navigate('/my-bookings'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                              <Inbox className="h-4 w-4 text-slate-400" /> การจองของฉัน
                            </button>
                          )}
                          {currentUser.role === 'admin' && (
                            <button onClick={() => { setDropdownOpen(false); navigate("/admin"); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                              <ShieldCheck className="h-4 w-4" /> ระบบจัดการ (Back Office)
                            </button>
                          )}
                          {currentUser.role === 'staff' && (
                            <button onClick={() => { setDropdownOpen(false); navigate("/staff"); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-xl transition-colors">
                              <Users className="h-4 w-4" /> ระบบจัดการ (Staff)
                            </button>
                          )}
                          <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
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
                  className="rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-white/20 shadow-md transition-all duration-300 font-bold tracking-wide text-sm h-auto"
                >
                  <User className="mr-1.5 h-4 w-4" />
                  เข้าสู่ระบบ
                </Button>
              )}
            </div>

            {/* Utility Actions Group (Bottom Row on Mobile) */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-lg overflow-x-auto no-scrollbar max-w-full sm:order-first z-40">
              {currentUser?.role === 'student' && (
                <>
                  <button 
                    onClick={() => navigate('/my-bookings')} 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all whitespace-nowrap"
                  >
                    <Inbox className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>สถานะการจอง</span>
                  </button>
                  <div className="w-[1px] h-3.5 bg-white/20 mx-0.5"></div>
                </>
              )}
              <button 
                onClick={onEvaluateClick} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all whitespace-nowrap"
              >
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>แบบประเมิน</span>
              </button>
              <div className="w-[1px] h-3.5 bg-white/20 mx-0.5"></div>
              <button 
                onClick={onReportClick} 
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-sm font-semibold text-amber-100 hover:text-white hover:bg-amber-500/30 rounded-lg transition-all whitespace-nowrap"
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
