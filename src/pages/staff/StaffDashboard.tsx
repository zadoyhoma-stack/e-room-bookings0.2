import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DoorOpen, 
  AlertTriangle, 
  Star, 
  ArrowRight, 
  ArrowUpRight,
  TrendingUp, 
  LogOut, 
  Users, 
  Sparkles,
  CheckCircle2,
  BarChart3,
  Settings,
  Camera,
  Save,
  X,
  MonitorPlay,
  Activity,
  Building2,
  Calendar as CalendarIcon,
  BarChart
} from "lucide-react";
import { Booking, Problem, Evaluation, Room } from "@/data/mockData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format, subDays, startOfWeek, addDays, getDay } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import * as ds from "@/services/dataService";

const timeToMinutes = (timeStr: string) => {
  const [h, m] = (timeStr || "00:00").split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

type ChartPeriod = "year" | "month" | "week" | "day";

const periodLabels: Record<ChartPeriod, string> = {
  year: "รายปี",
  month: "รายเดือน",
  week: "รายสัปดาห์",
  day: "รายวัน",
};

const StaffDashboard = () => {
  const queryClient = useQueryClient();
  const { currentUser, logout, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: "", profilePic: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("month");

  const { data: bookings = [] } = useQuery<Booking[]>({ queryKey: ["staff_bookings"], queryFn: () => ds.getBookings() });
  const { data: problems = [] } = useQuery<Problem[]>({ queryKey: ["staff_problems"], queryFn: () => ds.getProblems() });
  const { data: evaluations = [] } = useQuery<Evaluation[]>({ queryKey: ["staff_evaluations"], queryFn: () => ds.getEvaluations() });
  const { data: rooms = [] } = useQuery<Room[]>({ queryKey: ["staff_rooms"], queryFn: () => ds.getRooms() });
  const { data: users = [] } = useQuery({ queryKey: ["staff_users"], queryFn: () => ds.getUsers() });

  const pending = bookings.filter(b => b.status === "pending");

  // ──── Admin-style Dashboard Stats ────
  const totalBookings = bookings.length;
  const totalRooms = rooms.length;
  const activeUsers = users.length;

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const activeBookings = bookings.filter(b => b.date === todayStr && b.status === "approved" && nowMins >= timeToMinutes(b.startTime) && nowMins < timeToMinutes(b.endTime));
  const availableRoomsCount = Math.max(0, totalRooms - activeBookings.length);

  const bookingRate = totalRooms > 0 ? Math.round((activeBookings.length / totalRooms) * 100) + "%" : "0%";

  // ──── Chart data computation by period (same as Admin) ────
  const chartData = useMemo(() => {
    const monthNames = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

    if (chartPeriod === "year") {
      const yearMap: Record<string, number> = {};
      bookings.forEach(b => {
        if (!b.date) return;
        const yyyy = b.date.split('-')[0];
        if (yyyy) yearMap[yyyy] = (yearMap[yyyy] || 0) + 1;
      });
      const data = Object.keys(yearMap).sort().map(y => ({ name: `พ.ศ. ${parseInt(y) + 543}`, bookings: yearMap[y] }));
      return data.length > 0 ? data : [{ name: "ยังไม่มีข้อมูล", bookings: 0 }];
    }

    if (chartPeriod === "month") {
      const monthMap: Record<string, number> = {};
      bookings.forEach(b => {
        if (!b.date) return;
        const [yyyy, mm] = b.date.split('-');
        if (yyyy && mm) {
          const key = `${yyyy}-${mm}`;
          monthMap[key] = (monthMap[key] || 0) + 1;
        }
      });
      const data = Object.keys(monthMap).sort().slice(-6).map(key => {
        const [, mm] = key.split('-');
        return { name: monthNames[parseInt(mm)] || key, bookings: monthMap[key] };
      });
      return data.length > 0 ? data : [{ name: "ยังไม่มีข้อมูล", bookings: 0 }];
    }

    if (chartPeriod === "week") {
      const data: { name: string; bookings: number }[] = [];
      for (let w = 3; w >= 0; w--) {
        const weekStart = startOfWeek(subDays(now, w * 7), { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        const count = bookings.filter(b => {
          if (!b.date) return false;
          return b.date >= format(weekStart, 'yyyy-MM-dd') && b.date <= format(weekEnd, 'yyyy-MM-dd');
        }).length;
        data.push({
          name: `${format(weekStart, 'd MMM', { locale: th })} - ${format(weekEnd, 'd MMM', { locale: th })}`,
          bookings: count
        });
      }
      return data.some(d => d.bookings > 0) ? data : [{ name: "ยังไม่มีข้อมูล", bookings: 0 }];
    }

    // day: show each day of the current week (Mon-Sun)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const data: { name: string; bookings: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = bookings.filter(b => b.date === dateStr).length;
      const isToday = dateStr === todayStr;
      data.push({
        name: `${dayNames[getDay(date)]}${isToday ? " (วันนี้)" : ""}`,
        bookings: count
      });
    }
    return data;
  }, [bookings, chartPeriod, now, todayStr]);

  // Room usage data (same as Admin)
  const roomUsageMap: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.roomName) {
      roomUsageMap[b.roomName] = (roomUsageMap[b.roomName] || 0) + 1;
    }
  });
  const roomUsage = Object.keys(roomUsageMap).map(k => ({ name: k, usage: roomUsageMap[k] })).sort((a,b) => b.usage - a.usage).slice(0, 5);
  if (roomUsage.length === 0) {
    roomUsage.push({ name: "ยังไม่มีข้อมูล", usage: 0 });
  }

  // Peak usage density data — counts ALL hours each booking occupies, not just start time
  const peakDensity = useMemo(() => {
    const result: { time: string; count: number; density: number }[] = [];
    for (let h = 8; h <= 20; h++) {
      const hourStart = h * 60;
      const hourEnd = (h + 1) * 60;
      // Count approved bookings whose time range overlaps this hour slot
      const activeCount = bookings.filter(b => {
        if (!b.startTime || !b.endTime) return false;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return bStart < hourEnd && bEnd > hourStart;
      }).length;
      const density = totalRooms > 0 ? Math.round((activeCount / totalRooms) * 100) : 0;
      result.push({ time: `${h.toString().padStart(2, '0')}:00`, count: activeCount, density });
    }
    return result;
  }, [bookings, totalRooms]);

  const peakMax = useMemo(() => Math.max(...peakDensity.map(d => d.count), 1), [peakDensity]);

  const getDensityLevel = useCallback((density: number) => {
    if (density >= 75) return { label: "หนาแน่นมาก", color: "text-rose-600 bg-rose-50" };
    if (density >= 50) return { label: "หนาแน่น", color: "text-amber-600 bg-amber-50" };
    if (density >= 25) return { label: "ปานกลาง", color: "text-blue-600 bg-blue-50" };
    return { label: "ว่าง", color: "text-emerald-600 bg-emerald-50" };
  }, []);

  // Quick actions mutations
  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return ds.updateBookingStatus(id, status);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["staff_bookings"] }); 
      toast.success("อัปเดตสถานะการจองสำเร็จ"); 
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    }
  });

  const handleEditClick = () => {
    setEditForm({
      nickname: currentUser?.nickname || currentUser?.name || "",
      profilePic: currentUser?.profilePic || ""
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateUser({
        nickname: editForm.nickname,
        profilePic: editForm.profilePic
      });
      toast.success("อัปเดตโปรไฟล์เรียบร้อยแล้ว");
      setIsEditingProfile(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = currentUser?.nickname || currentUser?.name || "เจ้าหน้าที่";

  return (
    <div className="space-y-8 font-['Kanit',sans-serif] bg-slate-50/30 p-2 md:p-6 rounded-[40px] border border-slate-100/50">
      {/* ── Header Section with Dark Blue to Dark Gray Gradient ── */}
      <div className="relative flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 md:p-10 rounded-[32px] shadow-2xl shadow-blue-900/30 border border-blue-500/20 overflow-hidden text-white transition-all duration-300 group">
        
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 text-sky-300 font-bold text-xs tracking-wide mb-5 backdrop-blur-md border border-slate-700/50 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
            </span>
            {format(new Date(), "EEEE d MMMM yyyy", { locale: th })}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-3">
            <span className="block text-white drop-shadow-md">ภาพรวมการควบคุม</span>
            <span className="text-white/90 flex items-center gap-3 text-2xl md:text-3xl font-bold mt-2 drop-shadow-sm">
              ระบบจองห้องประชุม ARIT E-ROOMs
            </span>
          </h1>

        </div>

        {/* Profile Dropdown */}
        <div className="relative z-10 shrink-0 self-start md:self-auto flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-extrabold text-white">{displayName}</p>
            <p className="text-xs text-sky-200 font-semibold">{currentUser?.department || "ฝ่ายพัฒนาระบบสารสนเทศ"}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border-4 border-white/40 shadow-2xl hover:shadow-sky-300/30 hover:border-white hover:scale-105 transition-all duration-300 cursor-pointer outline-none relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-300/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {currentUser?.profilePic ? (
                  <img src={currentUser.profilePic} alt="" className="w-full h-full object-cover relative z-10" />
                ) : (
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-white relative z-10" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl bg-white/95 backdrop-blur-xl z-50">
              <div className="px-3 py-2.5 mb-1 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">{displayName}</p>
                <p className="text-[11px] font-semibold text-sky-600 mt-0.5">สิทธิ์: {currentUser?.role === 'staff' ? 'เจ้าหน้าที่ระบบ' : currentUser?.role}</p>
              </div>
              
              <DropdownMenuItem onClick={handleEditClick} className="text-slate-700 focus:text-slate-900 focus:bg-slate-50 cursor-pointer rounded-xl px-3 py-2.5 font-semibold flex items-center gap-2 mt-1 outline-none transition-colors">
                <Settings className="h-4 w-4" />
                <span>แก้ไขโปรไฟล์</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={logout} className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer rounded-xl px-3 py-2.5 font-semibold flex items-center gap-2 mt-1 outline-none transition-colors">
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ══════ Admin-style Stats Cards ══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[24px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-500" /> การจองทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{totalBookings}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> จำนวนทั้งหมด
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[24px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" /> ห้องว่างวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{availableRoomsCount} <span className="text-base font-medium text-slate-400">/ {totalRooms}</span></div>
            <div className="flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3 mr-1" /> พร้อมให้บริการ
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[24px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" /> ผู้ใช้งานทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{activeUsers}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-violet-600 bg-violet-50 dark:bg-violet-500/10 w-fit px-2 py-1 rounded-full">
              <Activity className="w-3 h-3 mr-1" /> ผู้ใช้ที่ลงทะเบียน
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[24px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-orange-500" /> อัตราใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{bookingRate}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-500/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> มีการใช้งานหนาแน่น
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════ Admin-style Charts ══════ */}
      <div className="space-y-8">
        
        {/* Chart 1 - Booking Trends with interactive period tabs */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[32px] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-500" /> แนวโน้มการจอง{periodLabels[chartPeriod]}
              </CardTitle>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
                {(Object.keys(periodLabels) as ChartPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                      chartPeriod === period
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700"
                    }`}
                  >
                    {periodLabels[period]}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="colorBookingsStaff" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
                    formatter={(value: number) => [`${value} รายการ`, 'จำนวนการจอง']}
                  />
                  <Bar dataKey="bookings" fill="url(#colorBookingsStaff)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-8">
          {/* Chart 2 - Room Usage */}
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[32px]">
            <CardHeader className="px-6 pt-6 pb-0">
              <CardTitle className="text-md font-bold text-slate-800 dark:text-white">การใช้งานแต่ละห้อง</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={roomUsage} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={150} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="usage" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={16} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3 — Peak Density */}
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[32px]">
            <CardHeader className="px-6 pt-6 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-bold text-slate-800 dark:text-white">ความหนาแน่นการใช้งานตามช่วงเวลา</CardTitle>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getDensityLevel(Math.round(peakDensity.reduce((s, d) => s + d.density, 0) / peakDensity.length)).color}`}>
                  เฉลี่ย {Math.round(peakDensity.reduce((s, d) => s + d.density, 0) / peakDensity.length)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={peakDensity} barCategoryGap="12%">
                    <defs>
                      <linearGradient id="densityGradientStaff" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                      cursor={{ fill: 'rgba(245, 158, 11, 0.06)', radius: 6 }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        const level = getDensityLevel(d.density);
                        return (
                          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 min-w-[180px]">
                            <p className="text-sm font-black text-slate-800 mb-2">🕐 เวลา {d.time} น.</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">จำนวนการจอง</span>
                                <span className="text-sm font-bold text-slate-800">{d.count} รายการ</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">ความหนาแน่น</span>
                                <span className="text-sm font-bold text-slate-800">{d.density}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">ระดับ</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${level.color}`}>{level.label}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="count" fill="url(#densityGradientStaff)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              {/* Density legend */}
              <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                {[
                  { label: "ว่าง (0-24%)", color: "bg-emerald-400" },
                  { label: "ปานกลาง (25-49%)", color: "bg-blue-400" },
                  { label: "หนาแน่น (50-74%)", color: "bg-amber-400" },
                  { label: "หนาแน่นมาก (75%+)", color: "bg-rose-400" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
                    <span className="text-[10px] font-semibold text-slate-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Pending Bookings Quick Actions ── */}
      <div className="bg-gradient-to-b from-white to-slate-50/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 text-orange-600 shadow-inner border border-orange-50">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">คำขอรออนุมัติ</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">รายการจองล่าสุดที่ต้องการตรวจสอบ</p>
            </div>
          </div>
          {pending.length > 0 && (
            <span className="text-xs font-extrabold bg-gradient-to-r from-orange-500 to-rose-500 text-white px-3 py-1 rounded-full shadow-md shadow-orange-500/20">
              {pending.length} รายการ
            </span>
          )}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto max-h-[260px] space-y-3 custom-scrollbar">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">ไม่มีคำขอรออนุมัติในขณะนี้</p>
              <p className="text-[11px] text-slate-400 mt-0.5">คำขอทั้งหมดได้รับการตอบรับแล้ว 🎉</p>
            </div>
          ) : (
            pending.slice(0, 5).map(b => (
              <div key={b.id} className="group relative flex items-center justify-between gap-3 p-4 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all duration-200">
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-full"></div>
                
                <div className="min-w-0 flex-1 pl-2">
                  <p className="text-xs font-extrabold text-slate-800 truncate">{b.roomName}</p>
                  <p className="text-[11px] font-bold text-indigo-600 truncate">{b.topic || "ไม่มีหัวข้อ"}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 truncate">{b.userName}</span>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <span className="text-[10px] font-semibold text-slate-500 truncate">{b.department || "ไม่ระบุหน่วยงาน"}</span>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => mutation.mutate({ id: b.id, status: "approved" })}
                    disabled={mutation.isPending}
                    className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/10 hover:scale-105 transition-all" 
                    title="อนุมัติการจอง"
                  >
                    <CheckCircle className="h-4.5 w-4.5" />
                  </button>
                  <button 
                    onClick={() => mutation.mutate({ id: b.id, status: "rejected" })}
                    disabled={mutation.isPending}
                    className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-xl hover:scale-105 transition-all" 
                    title="ปฏิเสธการจอง"
                  >
                    <XCircle className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-3xl">
          <Link to="/staff/bookings" className="text-xs text-blue-600 hover:text-blue-700 font-extrabold flex items-center justify-center gap-1 transition-colors group">
            เข้าสู่ระบบจัดการคำขอทั้งหมด 
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── Profile Editing Modal ── */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsEditingProfile(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEditingProfile(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                <Settings className="h-6 w-6" />
              </div>
              แก้ไขโปรไฟล์
            </h2>
            
            <div className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50">
                    {editForm.profilePic ? (
                      <img src={editForm.profilePic} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-10 w-10 text-slate-300 m-auto mt-6" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อแสดงผล / ชื่อเล่น</label>
                <input 
                  type="text" 
                  value={editForm.nickname}
                  onChange={e => setEditForm(p => ({ ...p, nickname: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all font-medium text-slate-800"
                  placeholder="เช่น พี่หมี"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ลิงก์รูปโปรไฟล์ (URL)</label>
                <input 
                  type="text" 
                  value={editForm.profilePic}
                  onChange={e => setEditForm(p => ({ ...p, profilePic: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all font-medium text-slate-800"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-slate-500 mt-2">ใส่ URL ของรูปภาพเพื่อใช้เป็นภาพโปรไฟล์</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
