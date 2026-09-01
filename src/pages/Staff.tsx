import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { CalendarCheck, DoorOpen, Star, Home, LogOut, Users, Menu, AlertTriangle, LayoutDashboard, Moon, Sun, Activity } from "lucide-react";
import React, { useState, useEffect, Suspense } from "react";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Booking, Problem } from "@/data/mockData";
import * as ds from "@/services/dataService";
import { useTheme } from "@/contexts/ThemeProvider";
import { toast } from "sonner";

// Lazy-load ทุก sub-page พร้อมระบบ auto-retry กรณี Vercel redeploy
const StaffDashboard = lazyWithRetry(() => import("./staff/StaffDashboard"));
const StaffBookings = lazyWithRetry(() => import("./staff/StaffBookings"));
const StaffRoomStatus = lazyWithRetry(() => import("./staff/StaffRoomStatus"));
const StaffEvaluations = lazyWithRetry(() => import("./staff/StaffEvaluations"));
const StaffProblems = lazyWithRetry(() => import("./staff/StaffProblems"));
const ActivityLogs = lazyWithRetry(() => import("./admin/ActivityLogs"));

const Staff = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { currentUser, isStaff, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Data sync listener — replaces Socket.IO
  useEffect(() => {
    const unsub = ds.onDataChange((key) => {
      if (key === ds.KEYS.bookings) {
        qc.invalidateQueries({ queryKey: ["staff_bookings"] });
      } else if (key === ds.KEYS.problems) {
        qc.invalidateQueries({ queryKey: ["staff_problems"] });
      } else if (key === ds.KEYS.rooms) {
        qc.invalidateQueries({ queryKey: ["staff_rooms"] });
      } else if (key === ds.KEYS.evaluations) {
        qc.invalidateQueries({ queryKey: ["staff_evaluations"] });
      }
    });
    return unsub;
  }, [qc]);

  // Live badge counts
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["staff_bookings"],
    queryFn: () => ds.getBookings(),
  });
  const { data: problems = [] } = useQuery<Problem[]>({
    queryKey: ["staff_problems"],
    queryFn: () => ds.getProblems(),
  });

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const pendingProblems = problems.filter((p) => p.status === "pending").length;

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: "ภาพรวม", path: "/staff", icon: LayoutDashboard, badge: 0 },
    { name: "อนุมัติการจอง", path: "/staff/bookings", icon: CalendarCheck, badge: pendingBookings },
    { name: "สถานะและประวัติ", path: "/staff/monitoring", icon: Activity, badge: 0 },
    { name: "สถานะห้อง", path: "/staff/rooms", icon: DoorOpen, badge: 0 },
    { name: "รายงานปัญหา", path: "/staff/problems", icon: AlertTriangle, badge: pendingProblems },
    { name: "แบบประเมิน", path: "/staff/evaluations", icon: Star, badge: 0 },
  ];

  const displayName = currentUser?.nickname || currentUser?.name || "เจ้าหน้าที่";

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ───────── Sidebar ───────── */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-200/60">
                <Users className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">ARIT E-ROOMs</p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold tracking-widest uppercase">Staff Panel</p>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                title="สลับธีม"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/" title="กลับหน้าหลักเว็บไซต์" className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors">
                <Home size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-1 pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">เมนูหลัก</p>
          {navItems.map((item) => {
            const isActive =
              item.path === "/staff"
                ? location.pathname === "/staff"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200 group relative",
                  isActive
                    ? "bg-sky-500 text-white font-semibold shadow-md shadow-sky-200/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                )}
              >
                <item.icon
                  size={20}
                  className={cn("shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")}
                />
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
        <div className="px-4 pb-5 pt-3 border-t border-slate-100 flex flex-col gap-3 mt-auto">
          <Link
            to="/?book=true"
            className="flex items-center gap-3.5 px-4 py-3.5 text-[15px] text-sky-600 hover:bg-sky-50 font-bold rounded-xl transition-colors border border-sky-100 bg-white"
          >
            <CalendarCheck size={20} className="text-sky-500" />
            จองห้อง (เจ้าหน้าที่)
          </Link>
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-4 text-white shadow-lg shadow-sky-200">
            <div className="relative z-10">
              <p className="text-sm font-bold mb-1">ARIT Support</p>
              <p className="text-xs text-sky-50 mb-3 leading-relaxed opacity-90">พบปัญหาการใช้งานระบบ? ติดต่อเจ้าหน้าที่ดูแลระบบได้เลยครับ</p>
              <button className="text-[11px] font-semibold bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-2 backdrop-blur-sm w-full flex items-center justify-center gap-1.5">
                ติดต่อเจ้าหน้าที่ธีรพงศ์ ชื่นชู
              </button>
            </div>
            {/* Decor blobs */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-0 -left-6 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
          </div>
        </div>
      </aside>

      {/* ───────── Main ───────── */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Decorative Background Blobs for Main Content */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-sky-300/30 to-blue-300/20 blur-3xl opacity-60"></div>
          <div className="absolute top-[30%] -left-[10%] w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-cyan-300/20 to-sky-400/20 blur-3xl opacity-60"></div>
          <div className="absolute -bottom-[15%] right-[10%] w-[50%] h-[40%] rounded-full bg-gradient-to-tl from-blue-300/20 to-indigo-300/20 blur-3xl opacity-50"></div>
        </div>

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-md flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">ARIT Staff</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto p-5 lg:p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                  <p className="text-sm text-slate-400 animate-pulse">กำลังโหลด...</p>
                </div>
              </div>
            }>
              <div className="page-transition">
                <Routes>
                  <Route path="/" element={<StaffDashboard />} />
                  <Route path="/bookings" element={<StaffBookings />} />
                  <Route path="/monitoring" element={<ActivityLogs />} />
                  <Route path="/rooms" element={<StaffRoomStatus />} />
                  <Route path="/problems" element={<StaffProblems />} />
                  <Route path="/evaluations" element={<StaffEvaluations />} />
                </Routes>
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Staff;
