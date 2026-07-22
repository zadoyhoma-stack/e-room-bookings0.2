import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, ShieldCheck, Users, GraduationCap, ChevronDown, Star, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onLoginClick: () => void;
  onProfileClick: () => void;
  onEvaluateClick: () => void;
  onReportClick: () => void;
}

const navLinks = [
  { label: 'หน้าหลัก', href: '#' },
  { label: 'ห้องประชุม', href: '#rooms' },
  { label: 'ปฏิทินห้องว่าง', href: '#calendar' },
  { label: 'วิธีจอง', href: '#how' },
  { label: 'รายงานปัญหา', href: '#report' },
  { label: 'ติดต่อ', href: '#contact' },
];

const ROLE_CONFIG: Record<UserRole, { label: string; icon: typeof ShieldCheck; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'text-violet-300', bg: 'bg-violet-500/20 border-violet-400/30' },
  staff: { label: 'เจ้าหน้าที่', icon: Users, color: 'text-sky-300', bg: 'bg-sky-500/20 border-sky-400/30' },
  student: { label: 'นักศึกษา', icon: GraduationCap, color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-400/30' },
};

// Mock notifications
const mockNotifications = [
  { id: 1, title: 'อนุมัติคำขอจองห้อง', desc: 'คำขอจอง "ห้องประชุมสำนักงาน" ของคุณได้รับการอนุมัติแล้ว', time: '10 นาทีที่แล้ว', read: false },
  { id: 2, title: 'แจ้งเตือนระบบ', desc: 'ยินดีต้อนรับเข้าสู่ระบบจองห้องประชุม ARIT E-ROOMs', time: '1 ชั่วโมงที่แล้ว', read: true }
];

export const Navbar = ({ onLoginClick, onProfileClick, onEvaluateClick, onReportClick }: NavbarProps) => {
  const { currentUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const roleConfig = currentUser ? ROLE_CONFIG[currentUser.role] : null;
  const RoleIcon = roleConfig?.icon ?? User;
  const displayName = currentUser?.role === 'admin' ? currentUser.name : (currentUser?.nickname || currentUser?.name);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[100px] sm:h-[110px] items-center justify-between">
          {/* Brand */}
          <a href="#" className="flex items-center gap-4 group">
            <div className="relative shrink-0 flex items-center justify-center py-1">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/ตรามหาลัย.png"
                alt="มหาวิทยาลัยราชภัฎมหาสารคาม"
                className="relative h-[96px] sm:h-[106px] w-auto object-contain mix-blend-multiply contrast-[1.05] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
              />
            </div>
            <div className="flex flex-col leading-tight ml-1 whitespace-nowrap">
              <span className="text-3xl font-bold text-primary tracking-tight">ARIT E-ROOMs</span>
              <span className="text-base text-muted-foreground/70 font-medium tracking-wide hidden sm:block">ม.ราชภัฎมหาสารคาม</span>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={l.label === 'รายงานปัญหา' ? (e) => { e.preventDefault(); onReportClick(); } : undefined}
                className="px-3 py-2 text-sm font-medium text-card-foreground/80 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors duration-200 whitespace-nowrap"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onEvaluateClick}
              className="px-3 py-2 text-sm font-medium text-card-foreground/80 hover:text-amber-500 rounded-lg hover:bg-amber-500/10 transition-colors duration-200 flex items-center gap-1.5 mr-2 group"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" /> 
              ให้คะแนน
            </button>
            <a href="#my-bookings" className="px-3 py-2 text-sm font-medium text-primary hover:underline whitespace-nowrap">
              สถานะการจองของฉัน
            </a>

            {currentUser && (
              <div className="relative mr-1 z-50">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setDropdownOpen(false);
                  }}
                  className="relative p-2 text-slate-500 hover:text-primary rounded-full hover:bg-primary/5 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-800">การแจ้งเตือน</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">อ่านทั้งหมด</button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className={cn("px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer", !n.read && "bg-blue-50/30")}>
                            <p className={cn("text-sm text-slate-800", !n.read && "font-semibold")}>{n.title}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.desc}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5">{n.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          ไม่มีการแจ้งเตือนใหม่
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentUser ? (
              /* User dropdown */
              <div className="relative z-50">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                    {currentUser.profilePic ? (
                      <img src={currentUser.profilePic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium", roleConfig?.bg, roleConfig?.color)}>
                    <RoleIcon className="h-3 w-3" />
                    {roleConfig?.label}
                  </div>
                  <span className="text-sm text-card-foreground font-medium max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl border border-white/15 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                        {currentUser.profilePic ? (
                          <img src={currentUser.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); onProfileClick(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-card-foreground hover:bg-white/5 transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      แก้ไขโปรไฟล์
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setDropdownOpen(false); navigate("/admin"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50/50 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        ระบบจัดการ (Back Office)
                      </button>
                    )}
                    {currentUser.role === 'staff' && (
                      <button
                        onClick={() => { setDropdownOpen(false); navigate("/staff"); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-sky-600 hover:bg-sky-50/50 transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        ระบบจัดการ (Staff)
                      </button>
                    )}
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={onLoginClick} size="sm" className="rounded-xl">
                เข้าสู่ระบบ
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-card-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 glass-strong border-t border-white/10",
        mobileOpen ? "max-h-96 py-4" : "max-h-0 py-0"
      )}>
        <div className="px-4 space-y-1">
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                if (l.label === 'รายงานปัญหา') {
                  e.preventDefault();
                  onReportClick();
                }
                setMobileOpen(false);
              }}
              className="block px-3 py-2 text-sm font-medium text-card-foreground/80 hover:text-primary rounded-lg"
            >
              {l.label}
            </a>
          ))}
          <hr className="border-border/50 my-2" />
          <button onClick={() => { setMobileOpen(false); onEvaluateClick(); }} className="w-full text-left px-3 py-2 text-sm font-medium text-card-foreground/80 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg flex items-center gap-2 transition-colors mb-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> ให้คะแนนระบบ
          </button>
          <a href="#my-bookings" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-primary">
            สถานะการจองของฉัน
          </a>
          {currentUser ? (
            <div className="space-y-1 pt-1">
              <div className="px-3 py-2 text-sm font-medium text-card-foreground">{displayName}</div>
              <button onClick={() => { setMobileOpen(false); onProfileClick(); }} className="w-full text-left px-3 py-2 text-sm text-card-foreground/70 flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> แก้ไขโปรไฟล์
              </button>
              {currentUser.role === 'admin' && (
                <button onClick={() => { setMobileOpen(false); navigate("/admin"); }} className="w-full text-left px-3 py-2 text-sm font-medium text-blue-500 flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> ระบบจัดการ (Back Office)
                </button>
              )}
              {currentUser.role === 'staff' && (
                <button onClick={() => { setMobileOpen(false); navigate("/staff"); }} className="w-full text-left px-3 py-2 text-sm font-medium text-sky-500 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> ระบบจัดการ (Staff)
                </button>
              )}
              <button onClick={() => { setMobileOpen(false); logout(); }} className="w-full text-left px-3 py-2 text-sm text-red-400 flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5" /> ออกจากระบบ
              </button>
            </div>
          ) : (
            <Button onClick={() => { onLoginClick(); setMobileOpen(false); }} size="sm" className="w-full rounded-xl mt-1">
              เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </div>

      {/* Backdrop for dropdown */}
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </nav>
  );
};
