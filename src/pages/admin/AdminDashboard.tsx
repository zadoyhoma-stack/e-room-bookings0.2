import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, MonitorPlay, Activity, CheckCircle2, Building2, Calendar as CalendarIcon, BarChart } from "lucide-react";
import { format, subDays, startOfWeek, addDays, getDay } from "date-fns";
import { th } from "date-fns/locale";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const AdminDashboard = () => {
  const { data: bookings = [] } = useQuery({ queryKey: ["admin_bookings"], queryFn: () => ds.getBookings() });
  const { data: rooms = [] } = useQuery({ queryKey: ["admin_rooms"], queryFn: () => ds.getRooms() });
  const { data: users = [] } = useQuery({ queryKey: ["admin_users"], queryFn: () => ds.getUsers() });

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("month");

  // Dashboard Stats calculations
  const totalBookings = bookings.length;
  const totalRooms = rooms.length;
  const activeUsers = users.length;
  
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const activeBookings = bookings.filter(b => b.date === todayStr && b.status === "approved" && nowMins >= timeToMinutes(b.startTime) && nowMins < timeToMinutes(b.endTime));
  const availableRoomsCount = Math.max(0, totalRooms - activeBookings.length);

  const bookingRate = totalRooms > 0 ? Math.round((activeBookings.length / totalRooms) * 100) + "%" : "0%";

  // ──────── Chart data computation by period ────────
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
      // Show last 4 weeks
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

  // Room usage data
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

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-slate-500 mt-2">ยินดีต้อนรับ! นี่คือข้อมูลสรุปสถานะการจองห้องประชุมในวันนี้</p>
      </div>

      {/* Stats Cards */}
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

      {/* Main Sections */}
      <div className="space-y-8">
        
          {/* Chart 1 - with interactive period tabs */}
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
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
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
                    <Bar dataKey="bookings" fill="url(#colorBookings)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Chart 2 */}
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
                        <linearGradient id="densityGradientAdmin" x1="0" y1="0" x2="0" y2="1">
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
                      <Bar dataKey="count" fill="url(#densityGradientAdmin)" radius={[6, 6, 0, 0]} maxBarSize={32} />
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
      
    </div>
  );
};

export default AdminDashboard;
