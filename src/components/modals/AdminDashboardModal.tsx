import { Booking } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Legend
} from "recharts";

interface AdminDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'approve' | 'stats';
  bookings: Booking[];
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const AdminDashboardModal = ({ open, onOpenChange, mode, bookings, onApprove, onReject }: AdminDashboardModalProps) => {
  const { canApprove } = useAuth();
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  // Prepare chart data
  const bookingsByDate = bookings.reduce((acc, booking) => {
    const date = booking.date;
    const existing = acc.find(item => item.name === date);
    if (existing) {
      existing.bookings += 1;
    } else {
      acc.push({ name: date, bookings: 1 });
    }
    return acc;
  }, [] as { name: string; bookings: number }[]);

  const bookingsByRoom = bookings.reduce((acc, booking) => {
    const roomName = booking.roomName || 'ไม่ระบุห้อง';
    const room = roomName.split(' ')[1] || roomName;
    const existing = acc.find(item => item.name === room);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: room, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-2xl border-white/30 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl text-card-foreground flex items-center gap-2">
            {mode === 'approve' ? <CheckSquare className="h-6 w-6 text-primary" /> : <TrendingUp className="h-6 w-6 text-primary" />}
            {mode === 'approve' ? 'จัดการคำขอจองห้องประชุม' : 'รายงานสรุป & สถิติการใช้งาน'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            {mode === 'approve' ? 'พิจารณาอนุมัติหรือปฏิเสธคำขอจองห้องประชุมจากผู้ใช้งาน' : 'ข้อมูลภาพรวมและสถิติการใช้ห้องประชุมในระบบ'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'approve' ? (
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/5 rounded-2xl border border-white/10">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Inbox className="h-12 w-12 text-primary/60" />
                </div>
                <p className="text-lg font-medium text-card-foreground">ไม่มีคำขอที่รออนุมัติ</p>
                <p className="text-sm">ระบบตรวจสอบไม่พบคำขอจองห้องประชุมใหม่</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBookings.map(b => (
                  <div key={b.id} className="flex flex-col p-5 bg-white/10 hover:bg-white/15 transition-colors rounded-2xl border border-white/20 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                        <div className="font-bold text-lg text-primary">{b.roomName}</div>
                        <div className="text-sm font-medium text-card-foreground/80 flex items-center gap-1.5 mt-1">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {b.date} • {b.startTime} – {b.endTime}
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    
                    <div className="space-y-2 mb-5 relative z-10">
                      <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">หัวข้อการประชุม</div>
                        <div className="text-sm text-card-foreground font-medium">{b.topic}</div>
                      </div>
                      {b.notes && (
                        <div className="text-sm text-muted-foreground bg-black/10 rounded-xl p-3 border border-white/5">
                          <span className="font-semibold text-card-foreground/70">หมายเหตุ:</span> {b.notes}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>ผู้เข้าร่วม: <strong className="text-card-foreground">{b.participants} คน</strong></span>
                      </div>
                    </div>
                    
                    {canApprove && (
                      <div className="flex gap-3 mt-auto relative z-10">
                        <Button className="flex-1 rounded-xl bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]" onClick={() => onApprove(b.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> อนุมัติ
                        </Button>
                        <Button variant="outline" className="flex-1 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300" onClick={() => onReject(b.id)}>
                          <XCircle className="mr-2 h-4 w-4" /> ปฏิเสธ
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
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'การจองทั้งหมด', value: bookings.length, icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'รออนุมัติ', value: bookings.filter(b => b.status === 'pending').length, icon: Inbox, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                { label: 'อนุมัติแล้ว', value: bookings.filter(b => b.status === 'approved').length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'ยกเลิก/ปฏิเสธ', value: bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
                  <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-110 transition-transform`} />
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</div>
                      <div className="text-3xl font-bold text-card-foreground">{stat.value}</div>
                    </div>
                    <div className={`p-2 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-card-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  แนวโน้มการจองรายวัน
                </h3>
                {bookingsByDate.length > 0 ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingsByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar dataKey="bookings" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">ไม่มีข้อมูลสถิติ</div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-card-foreground mb-6 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  สัดส่วนการจองแยกตามห้อง
                </h3>
                {bookingsByRoom.length > 0 ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingsByRoom}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {bookingsByRoom.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                          itemStyle={{ color: '#0f172a' }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">ไม่มีข้อมูลสถิติ</div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
