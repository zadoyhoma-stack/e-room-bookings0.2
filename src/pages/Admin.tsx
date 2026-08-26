import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, CalendarDays, Building2, Users, BarChart3, 
  Activity, Settings, FileText, DatabaseBackup, LogOut, 
  Search, Bell, MessageSquare, Moon, Sun, Menu, ChevronRight, Home,
  AlertTriangle, Star
} from "lucide-react";
import React, { useState, Suspense } from "react";

// Lazy-load ทุก sub-page เพื่อลด bundle size และโหลดเร็วขึ้น
const AdminDashboard = React.lazy(() => import("./admin/AdminDashboard"));
const ManageBookings = React.lazy(() => import("./admin/ManageBookings"));
const ManageUsers = React.lazy(() => import("./admin/ManageUsers"));
const RoomManagement = React.lazy(() => import("./admin/RoomManagement"));
const Reports = React.lazy(() => import("./admin/Reports"));
const ActivityLogs = React.lazy(() => import("./admin/ActivityLogs"));
const ManageProblems = React.lazy(() => import("./admin/ManageProblems"));
const ViewEvaluations = React.lazy(() => import("./admin/ViewEvaluations"));
const RealTimeMonitoring = React.lazy(() => import("./admin/RealTimeMonitoring"));

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { ProfileModal } from "@/components/modals/ProfileModal";

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, canApprove, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Redirect if not admin or staff
  if (!canApprove) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: "ภาพรวม", path: "/admin", icon: LayoutDashboard, badge: 0 },
    { name: "จัดการห้องประชุม", path: "/admin/rooms", icon: Building2, badge: 0 },
    { name: "จัดการผู้ใช้งาน", path: "/admin/users", icon: Users, hide: !isAdmin, badge: 0 },
    { name: "จัดการปัญหา", path: "/admin/problems", icon: AlertTriangle, badge: 0 },
    { name: "ผลการประเมิน", path: "/admin/evaluations", icon: Star, badge: 0 },
    { name: "รายงานและสถิติ", path: "/admin/reports", icon: BarChart3, badge: 0 },
    { name: "สถานะและประวัติ", path: "/admin/logs", icon: Activity, badge: 0 },
  ];

  const currentNavItem = navItems.find(item => item.path === location.pathname || (item.path !== "/admin" && location.pathname.startsWith(item.path))) || navItems[0];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 font-sans overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ───────── Sidebar ───────── */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                <Users className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-[15px] font-extrabold text-slate-800 tracking-tight">ARIT E-ROOMs</p>
                <p className="text-[10px] text-blue-600 font-semibold tracking-widest uppercase">Admin Panel</p>
              </div>
            </div>
            <Link to="/" title="กลับหน้าหลักเว็บไซต์" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              <Home size={18} />
            </Link>
          </div>
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className="px-3 pt-1 pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">เมนูหลัก</p>
          {navItems.filter(item => !item.hide).map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 group relative",
                  isActive 
                    ? "bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/30" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                )}
              >
                <item.icon size={20} className={cn("shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span className={cn(
                    "ml-auto min-w-[24px] h-6 flex items-center justify-center text-xs font-bold rounded-full px-2",
                    isActive ? "bg-white/25 text-white" : "bg-rose-500 text-white"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-slate-100 space-y-1.5">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3.5 px-4 py-6 rounded-xl text-[15px] text-red-600 hover:text-red-700 hover:bg-red-50 transition-all font-bold"
            onClick={() => {
              logout();
            }}
          >
            <LogOut size={20} />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* ───────── Main Content Area ───────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header (Hidden on Desktop to match Staff) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-sky-500 rounded-md flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">ARIT Admin</span>
          </div>
          <div className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">A</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setProfileOpen(true)}>โปรไฟล์</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={logout}>ออกจากระบบ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Desktop Top Navigation (Kept for Admin tools like search/notifications, but styled cleaner) */}
        <header className="hidden lg:flex h-16 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 items-center justify-between px-8 z-30 sticky top-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>ผู้ดูแลระบบ</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 dark:text-slate-100 font-semibold">{currentNavItem?.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="ค้นหา..." 
                className="pl-10 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-full h-9 transition-all text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-10 px-2 flex items-center gap-3 hover:bg-slate-100">
                  <Avatar className="w-8 h-8 shadow-sm">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-blue-100 text-blue-700">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-bold text-slate-700 leading-none">{user?.username || 'แอดมิน'}</span>
                    <span className="text-[11px] text-slate-500 mt-1">{user?.role || 'ผู้ดูแลระบบ'}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={() => setProfileOpen(true)}>โปรไฟล์</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-xl">การแจ้งเตือน</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-xl text-red-600" onClick={logout}>
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 relative">
          <div className="max-w-[1600px] mx-auto relative z-10 pb-20">
            <Suspense fallback={
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-400 animate-pulse">กำลังโหลด...</p>
                </div>
              </div>
            }>
              <div className="page-transition">
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/rooms" element={<RoomManagement />} />
                  <Route path="/users" element={<ManageUsers />} />
                  <Route path="/problems" element={<ManageProblems />} />
                  <Route path="/evaluations" element={<ViewEvaluations />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/logs" element={<ActivityLogs />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </div>
            </Suspense>
          </div>
        </main>
      </div>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default Admin;
