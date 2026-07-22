import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, Users, Wifi, Monitor, Mic, Tv, PenTool, Video, Clock, Settings } from "lucide-react";
import { Room, Booking } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as ds from "@/services/dataService";

const EQ_ICONS: Record<string, typeof Wifi> = { wifi: Wifi, projector: Monitor, microphone: Mic, tv: Tv, whiteboard: PenTool, videoconf: Video };
const EQ_LABELS: Record<string, string> = { wifi: "Wi-Fi", projector: "โปรเจคเตอร์", microphone: "ไมค์", tv: "ทีวี", whiteboard: "ไวท์บอร์ด", videoconf: "ประชุมทางไกล" };

const StaffRoomStatus = () => {
  const qc = useQueryClient();
  const { data: rooms = [], isLoading } = useQuery<Room[]>({ 
    queryKey: ["staff_rooms"], 
    queryFn: () => ds.getRooms()
  });
  
  const { data: bookings = [] } = useQuery<Booking[]>({ 
    queryKey: ["staff_bookings"], 
    queryFn: () => ds.getBookings()
  });
  const [floor, setFloor] = useState("all");

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "available" | "maintenance" }) => {
      return ds.updateRoomStatus(id, status);
    },
    onMutate: async (newRoom) => {
      await qc.cancelQueries({ queryKey: ["staff_rooms"] });
      const previousRooms = qc.getQueryData<Room[]>(["staff_rooms"]);
      if (previousRooms) {
        qc.setQueryData<Room[]>(["staff_rooms"], previousRooms.map(r => r.id === newRoom.id ? { ...r, status: newRoom.status } : r));
      }
      return { previousRooms };
    },
    onSuccess: () => { 
      toast.success("อัปเดตสถานะห้องสำเร็จ"); 
    },
    onError: (err, newRoom, context) => { 
      if (context?.previousRooms) {
        qc.setQueryData(["staff_rooms"], context.previousRooms);
      }
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["staff_rooms"] });
    }
  });

  const [realTimeDate, setRealTimeDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [realTimeHH, setRealTimeHH] = useState(format(new Date(), "HH:mm"));

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeDate(format(new Date(), "yyyy-MM-dd"));
      setRealTimeHH(format(new Date(), "HH:mm"));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = realTimeDate;
  const nowHH = realTimeHH;

  const getLive = (roomId: string) => {
    const active = bookings.find(b => b.roomId === roomId && b.date === todayStr && b.status === "approved" && nowHH >= b.startTime && nowHH < b.endTime);
    if (active) return { status: "in-use" as const, booking: active };
    const next = bookings.find(b => b.roomId === roomId && b.date === todayStr && (b.status === "approved" || b.status === "pending") && nowHH < b.startTime);
    if (next) return { status: "upcoming" as const, booking: next };
    return { status: "available" as const, booking: null };
  };

  const todaySlots = (roomId: string) => bookings.filter(b => b.roomId === roomId && b.date === todayStr && (b.status === "approved" || b.status === "pending"));

  const floors = Array.from(new Set(rooms.map(r => r.location))).sort();
  const filtered = floor === "all" ? rooms : rooms.filter(r => r.location === floor);

  const counts = {
    avail: filtered.filter(r => getLive(r.id).status === "available" && r.status !== "maintenance").length,
    inUse: filtered.filter(r => getLive(r.id).status === "in-use").length,
    upcoming: filtered.filter(r => getLive(r.id).status === "upcoming").length,
    maint: filtered.filter(r => r.status === "maintenance").length,
  };

  return (
    <div className="space-y-8 font-['Kanit',sans-serif] bg-slate-50/30 p-2 md:p-6 rounded-[40px] border border-slate-100/50">
      <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 shadow-2xl shadow-blue-900/30 border border-blue-500/20 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-[80px] group-hover:bg-sky-400/30 transition-colors duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
              <DoorOpen className="h-8 w-8 md:h-10 md:w-10 text-sky-300" />
            </div>
            สถานะห้องประชุม
          </h1>
          <p className="text-sm font-semibold text-sky-100 mt-4 ml-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400"></span>
            </span>
            อัปเดตสถานะห้องแบบ Real-time — {format(new Date(), "d MMMM yyyy", { locale: th })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "ว่าง", count: counts.avail, dot: "bg-sky-500", text: "text-sky-600", bg: "bg-sky-50/80 border-sky-100 shadow-sky-500/10 hover:shadow-sky-500/20" },
          { label: "ใช้งานอยู่", count: counts.inUse, dot: "bg-pink-500", text: "text-pink-600", bg: "bg-pink-50/80 border-pink-100 shadow-pink-500/10 hover:shadow-pink-500/20" },
          { label: "มีจองถัดไป", count: counts.upcoming, dot: "bg-amber-400", text: "text-amber-500", bg: "bg-amber-50/80 border-amber-100 shadow-amber-500/10 hover:shadow-amber-500/20" },
          { label: "ปิดปรับปรุง", count: counts.maint, dot: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-100/80 border-slate-200 shadow-slate-500/10 hover:shadow-slate-500/20" },
        ].map(s => (
          <div key={s.label} className={cn("flex flex-col gap-1 px-6 py-4 rounded-3xl border shadow-md transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm", s.bg)}>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("h-3.5 w-3.5 rounded-full shadow-sm animate-pulse", s.dot)} />
              <span className="text-sm text-slate-500 font-bold">{s.label}</span>
            </div>
            <span className={cn("text-4xl font-black drop-shadow-sm font-sans", s.text)}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Floor Filter */}
      {/* Floor Filter */}
      <div className="flex flex-wrap gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 w-fit">
        <button onClick={() => setFloor("all")} className={cn("px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300", floor === "all" ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-blue-500/30" : "bg-transparent text-slate-500 hover:text-blue-700 hover:bg-blue-50/50")}>
          ทุกชั้น
        </button>
        {floors.map(f => (
          <button key={f} onClick={() => setFloor(f)} className={cn("px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300", floor === f ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md shadow-blue-500/30" : "bg-transparent text-slate-500 hover:text-blue-700 hover:bg-blue-50/50")}>
            {f}
          </button>
        ))}
      </div>

      {/* Room Cards */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400"><div className="h-6 w-6 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />โหลดข้อมูล...</div>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(room => {
            const live = getLive(room.id);
            const isMaint = room.status === "maintenance";
            const slots = todaySlots(room.id);

            const cfg = isMaint
              ? { border: "border-slate-200", bg: "bg-slate-50/80", dot: "bg-slate-400", label: "ปิดปรับปรุง", textCol: "text-slate-500", glow: "" }
              : live.status === "in-use"
              ? { border: "border-pink-300 shadow-pink-200/50", bg: "bg-white/90", dot: "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]", label: "ใช้งานอยู่", textCol: "text-pink-600", glow: "from-pink-500" }
              : live.status === "upcoming"
              ? { border: "border-amber-300 shadow-amber-200/50", bg: "bg-white/90", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]", label: "มีจองถัดไป", textCol: "text-amber-500", glow: "from-amber-400" }
              : { border: "border-sky-200 shadow-sky-100/50", bg: "bg-white/90", dot: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]", label: "ว่าง", textCol: "text-sky-600", glow: "from-sky-400" };

            return (
              <div key={room.id} className={cn("relative rounded-3xl border p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 backdrop-blur-md overflow-hidden group", cfg.border, cfg.bg)}>
                {!isMaint && <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent", cfg.glow)}></div>}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 mr-2">
                    <h3 className="text-lg font-black text-slate-800 truncate drop-shadow-sm">{room.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{room.location}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50/80 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className={cn("h-3 w-3 rounded-full animate-pulse", cfg.dot)} />
                    <span className={cn("text-[11px] font-black uppercase tracking-wide", cfg.textCol)}>{cfg.label}</span>
                  </div>
                </div>

                {/* Capacity + Equipment */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Users className="h-3.5 w-3.5 text-sky-500" />{room.capacity} คน
                  </span>
                  {(room.equipment || []).slice(0, 3).map(eq => {
                    const Icon = EQ_ICONS[eq] || Wifi;
                    return <div key={eq} className="p-1.5 bg-slate-100 rounded-md" title={EQ_LABELS[eq]}><Icon className="h-3.5 w-3.5 text-slate-500" /></div>;
                  })}
                </div>

                {/* Active booking */}
                {live.booking && (
                  <div className={cn("rounded-lg p-3 border mb-3", live.status === "in-use" ? "bg-pink-50/50 border-pink-100" : "bg-amber-50/50 border-amber-100")}>
                    <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: live.status === "in-use" ? "#ec4899" : "#d97706" }}>
                      {live.status === "in-use" ? <DoorOpen className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      {live.status === "in-use" ? "กำลังใช้งาน" : "จองถัดไป"}
                    </p>
                    <p className="text-xs text-slate-700 truncate mt-1">{live.booking.topic || "—"} · {live.booking.userName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{live.booking.startTime}—{live.booking.endTime}</p>
                  </div>
                )}

                {/* Today schedule */}
                {slots.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                    {slots.map(s => (
                      <span key={s.id} className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                        s.status === "approved" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-orange-50 text-orange-700 border-orange-200"
                      )}>
                        {s.startTime}-{s.endTime}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Maintenance Toggle */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => toggleMutation.mutate({ id: room.id, status: isMaint ? "available" : "maintenance" })}
                    disabled={toggleMutation.isPending}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-sm disabled:opacity-50",
                      isMaint 
                        ? "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    {isMaint ? "เปิดใช้งานห้อง" : "ปิดปรับปรุง"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffRoomStatus;
