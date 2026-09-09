import { Booking } from "@/data/mockData";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckCircle, XCircle, Inbox, BarChart3, TrendingUp, Users, CalendarDays, CheckSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AdminDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "approve" | "stats";
  bookings: Booking[];
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
}

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export const AdminDashboardModal = ({
  open,
  onOpenChange,
  mode,
  bookings,
  onApprove,
  onReject,
}: AdminDashboardModalProps) => {
  const { canApprove } = useAuth();
  const pendingBookings = bookings.filter((b) => b.status === "pending");

  // Prepare chart data
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.date;
    const existing = acc.find((item) => item.name === date);
    if (existing) {
      existing.bookings += 1;
    } else {
      acc.push({ name: date, bookings: 1 });
    }
    return acc;
  }, [] as { name: string; bookings: number }[]);

  const bookingsByRoom = bookings.reduce((acc, booking) => {
    const roomName = booking.roomName || "ไม่ระบุห้อง";
    const room = roomName.split(" ")[1] || roomName;
    const existing = acc.find((item) => item.name === room);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: room, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      variant="info"
      icon={mode === "approve" ? <CheckSquare className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
      title={mode === "approve" ? "จัดการคำขอจองห้องประชุม (Pending Approvals)" : "รายงานสรุปและสถิติการใช้งาน"}
      description={
        mode === "approve"
          ? "พิจารณาอนุมัติหรือปฏิเสธคำขอจองห้องประชุมจากผู้ใช้งาน"
          : "ภาพรวมสถิติการจองและแนวโน้มการใช้งานห้องประชุม"
      }
      showCloseButton
    >
      {mode === "approve" ? (
        <div className="space-y-4">
          {pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-950/60 p-4 rounded-full mb-3 text-indigo-600 dark:text-indigo-400">
                <Inbox className="h-10 w-10" />
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-white">ไม่มีคำขอที่รออนุมัติ</p>
              <p className="text-xs text-slate-500 mt-1">ขณะนี้ไม่พบรายการจองใหม่ที่ค้างการอนุมัติในระบบ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col p-5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-base text-indigo-600 dark:text-indigo-400">{b.roomName}</div>
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-1">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {b.date} • {b.startTime} – {b.endTime} น.
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="text-slate-400 font-bold block mb-0.5">วัตถุประสงค์การจอง</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{b.topic}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      <span>ผู้เข้าร่วม: <strong className="text-slate-900 dark:text-white">{b.participants} คน</strong></span>
                    </div>
                  </div>

                  {canApprove && (
                    <div className="flex gap-2 mt-auto pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-md shadow-emerald-600/20"
                        onClick={() => onApprove(b.id)}
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> อนุมัติ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950 font-bold text-xs h-9"
                        onClick={() => onReject(b.id)}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> ปฏิเสธ
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Mini Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "การจองทั้งหมด", value: bookings.length, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/60" },
              { label: "รออนุมัติ", value: bookings.filter((b) => b.status === "pending").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/60" },
              { label: "อนุมัติแล้ว", value: bookings.filter((b) => b.status === "approved").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
              { label: "ยกเลิก/ปฏิเสธ", value: bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/60" },
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-2xl p-4 border border-slate-100 dark:border-slate-800 ${stat.bg}`}>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">{stat.label}</span>
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                แนวโน้มการจองรายวัน
              </h3>
              {bookingsByDate.length > 0 ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#ffffff", border: "none" }} />
                      <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-xs font-semibold">ไม่มีข้อมูลสถิติ</div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                สัดส่วนการจองแยกตามห้อง
              </h3>
              {bookingsByRoom.length > 0 ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bookingsByRoom} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                        {bookingsByRoom.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#ffffff", border: "none" }} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "11px", color: "#475569" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-xs font-semibold">ไม่มีข้อมูลสถิติ</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
};
