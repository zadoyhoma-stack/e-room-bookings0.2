import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, Search, Download, CalendarCheck, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { Booking, BookingStatus } from "@/data/mockData";
import * as ds from "@/services/dataService";

type Tab = "pending" | "approved" | "rejected" | "all";

const tabs: { key: Tab; label: string }[] = [
  { key: "pending", label: "รอตรวจสอบ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ไม่อนุมัติ" },
  { key: "all", label: "ทั้งหมด" },
];

const StaffBookings = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["staff_bookings"],
    queryFn: () => ds.getBookings(),
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      return ds.updateBookingStatus(id, status);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff_bookings"] }); toast.success("อัปเดตสถานะสำเร็จ"); },
    onError: () => toast.error("เกิดข้อผิดพลาด"),
  });

  const filtered = useMemo(() => {
    let r = tab === "all" ? bookings : bookings.filter(b => b.status === tab);
    if (search.trim()) {
      const t = search.toLowerCase();
      r = r.filter(b => b.roomName.toLowerCase().includes(t) || (b.userName || "").toLowerCase().includes(t) || (b.topic || "").toLowerCase().includes(t));
    }
    return r;
  }, [bookings, tab, search]);

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filtered.map(b => ({
      รหัส: b.id, ห้อง: b.roomName, วันที่: b.date, เริ่ม: b.startTime, สิ้นสุด: b.endTime,
      สถานะ: b.status, หัวข้อ: b.topic, ผู้จอง: b.userName, จำนวน: b.participants,
    }))), "รายการจอง");
    XLSX.writeFile(wb, `Staff_Bookings_${tab}.xlsx`);
  };

  const statusBadge = (s: BookingStatus) => {
    const cfg: Record<BookingStatus, { cls: string; icon: typeof Clock; text: string }> = {
      pending: { cls: "bg-orange-50 text-orange-700 border-orange-200", icon: Clock, text: "รอตรวจสอบ" },
      approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, text: "อนุมัติแล้ว" },
      rejected: { cls: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle, text: "ไม่อนุมัติ" },
      cancelled: { cls: "bg-slate-100 text-slate-500 border-slate-200", icon: XCircle, text: "ยกเลิก" },
    };
    const c = cfg[s];
    return <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border", c.cls)}><c.icon size={14} />{c.text}</span>;
  };

  return (
    <div className="space-y-8 font-['Kanit',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 drop-shadow-sm">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <CalendarCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            อนุมัติการจองห้อง
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-orange-600 font-bold mt-3 ml-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span> 
              มี {pendingCount} รายการรอตรวจสอบด่วน
            </p>
          )}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl shadow-md shadow-emerald-500/30 transition-all hover:-translate-y-1">
          <Download className="h-4 w-4" /> ส่งออก Excel
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200 shadow-lg shadow-slate-200/50">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn(
              "px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
              tab === t.key ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-500 hover:text-indigo-700 hover:bg-indigo-50/50"
            )}>
              {t.label}
              {t.key === "pending" && pendingCount > 0 && (
                <span className={cn("ml-2 px-2.5 py-0.5 text-[11px] font-black rounded-full", tab === "pending" ? "bg-white/30 text-white" : "bg-rose-500 text-white shadow-sm shadow-rose-500/40")}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            placeholder="ค้นหาห้อง, ผู้จอง..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-sm font-medium border border-slate-200 rounded-2xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/80">
                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">ห้อง / หัวข้อ</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">ผู้จอง</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">วัน-เวลา</th>
                <th className="px-4 py-3 text-left text-xs font-black text-slate-600 uppercase tracking-wider">สถานะ</th>
                <th className="px-4 py-3 text-right text-xs font-black text-slate-600 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {isLoading ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400"><div className="h-6 w-6 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-2" />กำลังโหลด...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400 text-xs">ไม่พบรายการ</td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-slate-800 text-base max-w-[250px]">{b.roomName}</p>
                      <p className="text-sm font-bold text-slate-600 max-w-[250px] mt-1">{b.topic || "—"}</p>
                      {b.extraEquipment && <p className="text-[11px] font-semibold text-orange-600 mt-1.5 bg-orange-50 px-2 py-0.5 rounded-md inline-block">อุปกรณ์เพิ่มเติม: {b.extraEquipment}</p>}
                      {b.notes && <p className="text-[11px] text-slate-500 mt-1 max-w-[250px]">หมายเหตุ: {b.notes}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-50 mt-1"><UsersIcon className="h-5 w-5 text-indigo-600" /></div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{b.userName}</p>
                          <p className="text-[11px] font-bold text-indigo-600 mt-0.5">{b.department || "ไม่ระบุหน่วยงาน"}</p>
                          <p className="text-[11px] font-medium text-slate-500 mt-1">
                            {b.email ? `${b.email} · ` : ""}{b.phone}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            จำนวน {b.participants} คน
                            {b.participantList && b.participantList.length > 0 && ` (${b.participantList.length} รายชื่อ)`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-extrabold text-slate-700 text-sm">{b.date}</p>
                      <p className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md inline-block mt-1.5">{b.startTime} — {b.endTime}</p>
                    </td>
                    <td className="px-6 py-5">{statusBadge(b.status)}</td>
                    <td className="px-4 py-3">
                      {b.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => mutation.mutate({ id: b.id, status: "approved" })}
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-lg shadow-sm shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                          >
                            <CheckCircle size={14} /> อนุมัติ
                          </button>
                          <button
                            onClick={() => mutation.mutate({ id: b.id, status: "rejected" })}
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                          >
                            <XCircle size={14} /> ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffBookings;
