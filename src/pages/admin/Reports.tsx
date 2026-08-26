import { useState, useMemo } from "react";
import { Download, FileText, Calendar, Filter, FileSpreadsheet, FileIcon, BarChart3, TrendingUp, CheckCircle, XCircle, Award, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ds from "@/services/dataService";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery<any[]>({
    queryKey: ["reports"],
    queryFn: () => ds.getReports()
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["admin_bookings"],
    queryFn: () => ds.getBookings()
  });

  // Calculate Statistics
  const stats = useMemo(() => {
    let total = bookings.length;
    let approved = 0;
    let rejected = 0;
    const roomCounts: Record<string, number> = {};
    const monthCounts: Record<string, number> = {};

    bookings.forEach(b => {
      if (b.status === "approved" || b.status === "completed") approved++;
      if (b.status === "rejected" || b.status === "cancelled") rejected++;
      
      if (b.roomName) {
        roomCounts[b.roomName] = (roomCounts[b.roomName] || 0) + 1;
      }

      if (b.date) {
        const [yyyy, mm] = b.date.split('-');
        if (yyyy && mm) {
          const key = `${yyyy}-${mm}`;
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
      }
    });

    let popularRoom = { name: "ยังไม่มีข้อมูล", count: 0 };
    const roomUsageData = Object.entries(roomCounts).map(([name, value]) => {
      if (value > popularRoom.count) popularRoom = { name, count: value };
      return { name, value };
    }).sort((a,b) => b.value - a.value).slice(0, 5);

    if (roomUsageData.length === 0) roomUsageData.push({ name: "ไม่มีข้อมูล", value: 1 });

    const monthNames = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthlyData = Object.keys(monthCounts).sort().slice(-6).map(key => {
      const [, mm] = key.split('-');
      return {
        name: monthNames[parseInt(mm)],
        "จำนวนการจอง": monthCounts[key]
      };
    });

    if (monthlyData.length === 0) monthlyData.push({ name: "ไม่มีข้อมูล", "จำนวนการจอง": 0 });

    return { total, approved, rejected, popularRoom, roomUsageData, monthlyData };
  }, [bookings]);

  const generateMutation = useMutation({
    mutationFn: ds.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "บันทึกประวัติการส่งออกสำเร็จ",
        description: "ระบบได้บันทึกประวัติการส่งออกข้อมูลแล้ว",
        variant: "default",
      });
    }
  });

  const handleExport = (formatType: string) => {
    generateMutation.mutate({
      type: "รายงานสรุปสถิติ",
      room: "ภาพรวมทุกห้อง",
      format: formatType
    });
    toast({
      title: `กำลังส่งออกเป็น ${formatType}`,
      description: "ระบบกำลังเตรียมไฟล์รายงานให้คุณสักครู่...",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-[24px] shadow-lg shadow-slate-200/50 dark:shadow-none backdrop-blur-xl border border-white/50 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            รายงานและสถิติ
          </h1>
          <p className="text-slate-500 mt-2 font-medium">ภาพรวมการใช้งานห้องประชุม และสรุปข้อมูลสถิติของระบบ</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 h-12 px-6 font-bold transition-all hover:scale-105">
              <Download className="w-5 h-5 mr-2" /> ส่งออกรายงาน
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-200 shadow-xl">
            <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">เลือกรูปแบบไฟล์</div>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-3 font-medium hover:bg-slate-50" onClick={() => handleExport("PDF")}>
              <FileIcon className="w-5 h-5 mr-3 text-rose-500" /> สรุปสถิติ (PDF)
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-3 font-medium hover:bg-slate-50" onClick={() => handleExport("Excel")}>
              <FileSpreadsheet className="w-5 h-5 mr-3 text-emerald-500" /> ข้อมูลดิบ (Excel)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">การจองทั้งหมด</p>
                <h3 className="text-4xl font-black text-slate-800 dark:text-white">{stats.total}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">อนุมัติแล้ว / ใช้งาน</p>
                <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">ยกเลิก / ไม่อนุมัติ</p>
                <h3 className="text-4xl font-black text-rose-600 dark:text-rose-400">{stats.rejected}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-indigo-100 mb-1">ห้องยอดนิยม</p>
                <h3 className="text-xl font-black mt-1 truncate max-w-[140px]" title={stats.popularRoom.name}>{stats.popularRoom.name}</h3>
                <p className="text-xs text-indigo-200 mt-1">{stats.popularRoom.count} ครั้ง</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[24px]">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              แนวโน้มการจอง (6 เดือนล่าสุด)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="จำนวนการจอง" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {stats.monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[24px]">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              สัดส่วนการใช้งานห้อง
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.roomUsageData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.roomUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export History Table */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> 
            ประวัติการส่งออกรายงาน
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="ค้นหารายงาน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white rounded-xl" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/30">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">วันที่</th>
                <th className="px-6 py-4 font-bold tracking-wider">ประเภทรายงาน</th>
                <th className="px-6 py-4 font-bold tracking-wider">เป้าหมาย</th>
                <th className="px-6 py-4 font-bold tracking-wider">สถานะ</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">ยังไม่มีประวัติการส่งออกรายงานในระบบ</td></tr>
              ) : reports.filter(r => r.type.includes(searchTerm) || r.room.includes(searchTerm)).map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                      <Calendar className="w-4 h-4 text-slate-400" /> {format(new Date(report.createdAt), "dd MMM yyyy", { locale: th })}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {report.format === 'PDF' ? <FileIcon className="w-4 h-4 text-rose-500" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                    {report.type}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                    {report.room}
                  </td>
                  <td className="px-6 py-4">
                    {report.status === "Generated" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        พร้อมใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                        กำลังเตรียมไฟล์
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors font-bold"
                      disabled={report.status !== "Generated"}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> โหลดไฟล์
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
