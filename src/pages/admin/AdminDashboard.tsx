import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, AlertTriangle, TrendingUp, Download, Building, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, MonitorPlay, Activity, LogIn, CheckCircle2, Building2, Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import * as XLSX from "xlsx";
import { Room, Booking, Problem, Evaluation } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as ds from "@/services/dataService";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const { data: bookings = [] } = useQuery({ queryKey: ["admin_bookings"], queryFn: () => ds.getBookings() });
  const { data: rooms = [] } = useQuery({ queryKey: ["admin_rooms"], queryFn: () => ds.getRooms() });

  // Dashboard Stats calculations
  const totalBookings = bookings.length;
  const totalRooms = rooms.length;
  
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const nowHH = format(now, 'HH:mm');
  const activeBookings = bookings.filter(b => b.date === todayStr && b.status === "approved" && nowHH >= b.startTime && nowHH < b.endTime);
  const availableRoomsCount = Math.max(0, totalRooms - activeBookings.length);

  const activeUsers = 124; // Mocked
  const bookingRate = "78%"; // Mocked

  // Mock data for charts
  const monthlyTrends = [
    { name: "ม.ค.", bookings: 45 }, { name: "ก.พ.", bookings: 52 }, { name: "มี.ค.", bookings: 38 },
    { name: "เม.ย.", bookings: 65 }, { name: "พ.ค.", bookings: 48 }, { name: "มิ.ย.", bookings: 71 },
  ];

  const roomUsage = [
    { name: "ห้องประชุม A", usage: 85 }, { name: "ห้องประชุม B", usage: 62 }, 
    { name: "ห้องอ่านหนังสือ C", usage: 93 }, { name: "ห้องบอร์ดรูม", usage: 41 },
  ];

  const peakUsage = [
    { time: "08:00", count: 12 }, { time: "10:00", count: 35 }, { time: "12:00", count: 15 },
    { time: "14:00", count: 42 }, { time: "16:00", count: 28 }, { time: "18:00", count: 8 },
  ];

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
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-blue-100 font-medium text-sm">การจองทั้งหมด</CardTitle>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black">{totalBookings > 0 ? totalBookings : 156}</div>
            <div className="flex items-center mt-2 text-xs font-medium text-blue-100 bg-white/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% ในเดือนนี้
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="bg-gradient-to-br from-sky-400 to-blue-500 text-white border-0 shadow-lg shadow-sky-900/20 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sky-50 font-medium text-sm">จำนวนห้องทั้งหมด</CardTitle>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black">{totalRooms > 0 ? totalRooms : 12}</div>
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

      {/* Main Sections Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts (takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart 1 */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[32px] overflow-hidden">
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
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[32px]">
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
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[32px]">
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

        {/* Right Column: Real-Time Monitoring */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-emerald-500" />
            สถานะเรียลไทม์
          </h2>
          
          <Card className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">ผู้ใช้งานออนไลน์</div>
                <div className="text-3xl font-black text-slate-800 dark:text-white mt-1 flex items-center gap-3">
                  42
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">เข้าสู่ระบบล่าสุด</h3>
              
              {[
                { name: "Sompong J.", role: "นักศึกษา", time: "เมื่อสักครู่" },
                { name: "Malee W.", role: "เจ้าหน้าที่", time: "2 นาทีที่แล้ว" },
                { name: "John Doe", role: "นักศึกษา", time: "5 นาทีที่แล้ว" },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.role}</div>
                  </div>
                  <div className="text-xs font-medium text-slate-400">{user.time}</div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">การจองล่าสุด</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">ห้องประชุม A ถูกจอง</div>
                    <div className="text-xs text-slate-500 mt-0.5">โดย Nattapong • วันนี้ 14:00</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">ห้องอ่านหนังสือ C สิ้นสุดการจอง</div>
                    <div className="text-xs text-slate-500 mt-0.5">10 นาทีที่แล้ว</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;
