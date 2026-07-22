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
  X
} from "lucide-react";
import { Booking, Problem, Evaluation, Room } from "@/data/mockData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import * as ds from "@/services/dataService";

const StaffDashboard = () => {
  const queryClient = useQueryClient();
  const { currentUser, logout, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: "", profilePic: "" });
  const [isSaving, setIsSaving] = useState(false);
  const { data: bookings = [] } = useQuery<Booking[]>({ queryKey: ["staff_bookings"], queryFn: () => ds.getBookings() });
  const { data: problems = [] } = useQuery<Problem[]>({ queryKey: ["staff_problems"], queryFn: () => ds.getProblems() });
  const { data: evaluations = [] } = useQuery<Evaluation[]>({ queryKey: ["staff_evaluations"], queryFn: () => ds.getEvaluations() });
  const { data: rooms = [] } = useQuery<Room[]>({ queryKey: ["staff_rooms"], queryFn: () => ds.getRooms() });

  const pending = bookings.filter(b => b.status === "pending");
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const occupiedIds = new Set(bookings.filter(b => b.status === "approved" && b.date === todayStr).map(b => b.roomId));
  const availCount = rooms.filter(r => !occupiedIds.has(r.id) && r.status !== "maintenance").length;
  const pendingProblemsCount = problems.filter(p => p.status === "pending").length;
  const avgRating = evaluations.length ? (evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length).toFixed(1) : "—";

  // Chart data setup for 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { 
      name: format(d, "EEE", { locale: th }), 
      count: bookings.filter(b => b.date === format(d, "yyyy-MM-dd")).length 
    };
  });



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
      {/* ── Header Section with Dark Blue to Dark Gray Gradient and Floating Orbs ── */}
      <div className="relative flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 md:p-10 rounded-[32px] shadow-2xl shadow-blue-900/30 border border-blue-500/20 overflow-hidden text-white transition-all duration-300 group">
        
        {/* Soft Decorative Ambient Orbs */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-pulse-slow group-hover:bg-blue-500/30 transition-colors duration-700" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen group-hover:bg-sky-500/20 transition-colors duration-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none mix-blend-overlay" />
        
        <div className="relative z-10 flex-1">
          {/* Real-time date badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 text-sky-300 font-bold text-xs tracking-wide mb-5 backdrop-blur-md border border-slate-700/50 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
            </span>
            {format(new Date(), "EEEE d MMMM yyyy", { locale: th })}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-3">
            <span className="block text-white drop-shadow-md">ภาพรวมการควบคุม</span>
            <span className="text-white/90 flex items-center gap-3 text-2xl md:text-3xl font-bold mt-2 drop-shadow-sm">
              ระบบจองห้องประชุม ARIT E-ROOMs <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
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

      {/* ── Stats Section: Premium Floating Glass Cards ── */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: "รายการรออนุมัติ", 
            value: pending.length, 
            desc: "รอการตรวจสอบความถูกต้อง",
            icon: Clock, 
            bg: "bg-gradient-to-br from-indigo-500 to-purple-600", 
            shadow: "shadow-indigo-500/30", 
            borderHover: "hover:border-indigo-300",
            text: "text-indigo-600",
            link: "/staff/bookings" 
          },
          { 
            label: "ห้องประชุมที่ว่างวันนี้", 
            value: `${availCount}/${rooms.length}`, 
            desc: "พร้อมใช้งานในขณะนี้",
            icon: DoorOpen, 
            bg: "bg-gradient-to-br from-emerald-400 to-cyan-500", 
            shadow: "shadow-emerald-500/30", 
            borderHover: "hover:border-cyan-300",
            text: "text-cyan-600",
            link: "/staff/rooms" 
          },
          { 
            label: "รายงานปัญหารอแก้ไข", 
            value: pendingProblemsCount, 
            desc: "แจ้งเหตุขัดข้องจากผู้ใช้",
            icon: AlertTriangle, 
            bg: "bg-gradient-to-br from-amber-400 to-rose-500", 
            shadow: "shadow-rose-500/30", 
            borderHover: "hover:border-rose-300",
            text: "text-rose-500",
            link: "/staff/problems" 
          },
          { 
            label: "คะแนนบริการเฉลี่ย", 
            value: avgRating, 
            desc: "คะแนนพึงพอใจการใช้งาน",
            icon: Star, 
            bg: "bg-gradient-to-br from-fuchsia-500 to-pink-500", 
            shadow: "shadow-fuchsia-500/30", 
            borderHover: "hover:border-fuchsia-300",
            text: "text-fuchsia-500",
            link: "/staff/evaluations" 
          },
        ].map((s) => (
          <Link key={s.label} to={s.link} className="group">
            <div className={cn("relative overflow-hidden rounded-[28px] p-6 bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5", s.borderHover, `hover:${s.shadow}`)}>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-slate-100 to-transparent rounded-full transition-transform duration-700 group-hover:scale-150 group-hover:opacity-70"></div>
              
              <div className={cn("relative h-14 w-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", s.bg, s.shadow)}>
                <s.icon className="h-7 w-7 text-white" />
              </div>
              
              <div className="relative">
                <p className="text-4xl font-black tracking-tight text-slate-800 drop-shadow-sm font-sans">{s.value}</p>
                <p className="text-sm font-bold text-slate-700 mt-2">{s.label}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{s.desc}</p>
              </div>
              
              <div className={cn("absolute bottom-5 right-5 text-slate-200 transition-colors duration-300 group-hover:scale-110", s.text)}>
                <ArrowUpRight className="h-6 w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Chart & Pending Bookings Rows ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Panel: Analytics Chart & Usage Insights */}
        <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/50 p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-inner border border-indigo-50">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">สถิติการจองห้องประชุมในรอบ 7 วัน</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">ข้อมูลวิเคราะห์ภาพรวมการใช้งานประจำสัปดาห์</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full shadow-sm border border-indigo-100">{bookings.length} รายการจองรวม</span>
            </div>
            
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={26}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={20} />
                  <Tooltip
                    cursor={{ fill: "rgba(37, 99, 235, 0.04)", radius: 6 }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", fontSize: "12px", fontFamily: "sans-serif" }}
                    formatter={(v: number) => [`${v} รายการจอง`, "ยอดการจอง"]}
                  />
                  <Bar dataKey="count" fill="url(#blue-gradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick usage insights bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-600 animate-ping"></div>
              <span className="text-xs font-bold text-slate-600">อัตราการจองเฉลี่ยรายวันอยู่ในเกณฑ์ปกติ</span>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">รอประเมินผล</span>
                <span className="text-sm font-extrabold text-slate-800">{evaluations.length} รายการ</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-100" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">ปัญหาได้รับการแก้ไข</span>
                <span className="text-sm font-extrabold text-emerald-600">{problems.filter(p => p.status === "resolved").length} เรื่อง</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Pending Bookings Quick Actions */}
        <div className="lg:col-span-2 bg-gradient-to-b from-white to-slate-50/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden">
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
      </div>

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
