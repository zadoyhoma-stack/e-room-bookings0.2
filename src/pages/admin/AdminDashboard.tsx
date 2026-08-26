import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, MonitorPlay, Activity, CheckCircle2, Building2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as ds from "@/services/dataService";

const timeToMinutes = (timeStr: string) => {
  const [h, m] = (timeStr || "00:00").split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const AdminDashboard = () => {
  const { data: bookings = [] } = useQuery({ queryKey: ["admin_bookings"], queryFn: () => ds.getBookings() });
  const { data: rooms = [] } = useQuery({ queryKey: ["admin_rooms"], queryFn: () => ds.getRooms() });
  const { data: users = [] } = useQuery({ queryKey: ["admin_users"], queryFn: () => ds.getUsers() });

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

  // Real data for charts
  const monthlyTrendsMap: Record<string, number> = {};
  bookings.forEach(b => {
    if (!b.date) return;
    const [yyyy, mm] = b.date.split('-');
    if (yyyy && mm) {
      const key = `${yyyy}-${mm}`;
      monthlyTrendsMap[key] = (monthlyTrendsMap[key] || 0) + 1;
    }
  });
  
  const monthlyTrends = Object.keys(monthlyTrendsMap).sort().slice(-6).map(key => {
    const [, mm] = key.split('-');
    const monthNames = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return { name: monthNames[parseInt(mm)] || key, bookings: monthlyTrendsMap[key] };
  });
  if (monthlyTrends.length === 0) {
    monthlyTrends.push({ name: "ยังไม่มีข้อมูล", bookings: 0 });
  }

  const roomUsageMap: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.roomName) {
      roomUsageMap[b.roomName] = (roomUsageMap[b.roomName] || 0) + 1;
    }
  });
  const roomUsage = Object.keys(roomUsageMap).map(k => ({ name: k, usage: roomUsageMap[k] })).sort((a,b) => b.usage - a.usage).slice(0, 4);
  if (roomUsage.length === 0) {
    roomUsage.push({ name: "ยังไม่มีข้อมูล", usage: 0 });
  }

  const peakUsageMap: Record<string, number> = {};
  bookings.forEach(b => {
    if (b.startTime) {
      const hour = b.startTime.split(':')[0] + ":00";
      peakUsageMap[hour] = (peakUsageMap[hour] || 0) + 1;
    }
  });
  const peakUsage = Object.keys(peakUsageMap).sort().map(k => ({ time: k, count: peakUsageMap[k] }));
  if (peakUsage.length === 0) {
    peakUsage.push({ time: "08:00", count: 0 });
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-slate-500 mt-2">ยินดีต้อนรับ! นี่คือข้อมูลสรุปสถานะการจองห้องประชุมในวันนี้</p>
      </div>

      {/* 4 Statistic Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0 shadow-lg shadow-blue-900/20 rounded-3xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-blue-100 font-medium text-sm">การจองทั้งหมด</CardTitle>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black">{totalBookings || 0}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-blue-100 bg-white/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% ในเดือนนี้
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="bg-gradient-to-br from-sky-400 to-blue-500 text-white border-0 shadow-lg shadow-sky-900/20 rounded-3xl overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sky-50 font-medium text-sm">จำนวนห้องทั้งหมด</CardTitle>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black">{totalRooms || 0}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-sky-50 bg-white/10 w-fit px-2 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3 mr-1" /> {availableRoomsCount} ห้องว่างใช้งาน
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-500 dark:text-slate-400 font-medium text-sm">ผู้ใช้งานปัจจุบัน</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-white">{activeUsers}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +4.2% ในสัปดาห์นี้
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-500 dark:text-slate-400 font-medium text-sm">อัตราการจองห้อง</CardTitle>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
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
        
          {/* Chart 1 */}
          <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[32px] overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-0">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-500" /> แนวโน้มการจองรายเดือน
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} 
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="bookings" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                  </AreaChart>
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
                    <BarChart data={roomUsage} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="usage" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 3 */}
            <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-lg rounded-[32px]">
              <CardHeader className="px-6 pt-6 pb-0">
                <CardTitle className="text-md font-bold text-slate-800 dark:text-white">ช่วงเวลาที่มีการใช้งานหนาแน่น</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={peakUsage}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="smooth" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
