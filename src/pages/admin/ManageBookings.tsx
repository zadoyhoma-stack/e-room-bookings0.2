import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, Trash2, Trophy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { Booking, BookingStatus } from "@/data/mockData";
import * as ds from "@/services/dataService";

type BookingFilter = "all" | BookingStatus;

const bookingFilters: BookingFilter[] = ["all", "pending", "approved", "rejected"];

const ManageBookings = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<BookingFilter>("all");

  const { data: bookings = [], isLoading } = useQuery({ 
    queryKey: ["admin_bookings"], 
    queryFn: () => ds.getBookings()
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      return ds.updateBookingStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
      toast.success("อัปเดตสถานะการจองสำเร็จ");
    },
    onError: () => {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  });

  const filteredBookings = bookings.filter((b) => filter === "all" ? true : b.status === filter);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={14} /> อนุมัติแล้ว</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle size={14} /> ไม่อนุมัติ</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"><Trash2 size={14} /> ยกเลิก</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"><Clock size={14} /> รอตรวจสอบ</span>;
    }
  };

  const topRooms = useMemo(() => {
    const stats = bookings.reduce((acc, b) => {
      // นับเฉพาะที่ไม่อนุมัติหรือยกเลิกไหม? ลองนับทั้งหมดก่อน
      if (b.status !== 'rejected' && b.status !== 'cancelled') {
        const name = b.roomName;
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [bookings]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsBookings = XLSX.utils.json_to_sheet(filteredBookings.map(b => ({
      'รหัสการจอง': b.id,
      'ห้องประชุม': b.roomName,
      'วันที่': b.date,
      'เวลาเริ่ม': b.startTime,
      'เวลาสิ้นสุด': b.endTime,
      'สถานะ': b.status,
      'หัวข้อ': b.topic,
      'ผู้จอง': b.userName,
      'หน่วยงาน': b.department || '-',
      'อีเมล': b.email || '-',
      'เบอร์โทร': b.phone || '-',
      'จำนวนผู้เข้าร่วม': b.participants,
      'อุปกรณ์เพิ่มเติม': b.extraEquipment || '-',
      'หมายเหตุ': b.notes || '-'
    })));
    XLSX.utils.book_append_sheet(wb, wsBookings, "รายการจอง");
    XLSX.writeFile(wb, `ARIT_EROOMs_Bookings_${filter}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">จัดการการจองห้อง</h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
            {bookingFilters.map((f) => (
              <button
                key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                filter === f 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
                {f === "all" ? "ทั้งหมด" : f === "pending" ? "รอตรวจสอบ" : f === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}
              </button>
            ))}
          </div>
          <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm h-10">
            <Download className="mr-2 h-4 w-4" /> ส่งออก Excel
          </Button>
        </div>
      </div>

      {/* Top 3 Rooms Leaderboard */}
      {!isLoading && topRooms.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-2 mb-4 text-blue-800 dark:text-blue-300">
            <Trophy className="h-5 w-5" />
            <h3 className="font-bold">3 อันดับห้องยอดฮิต (ที่ถูกจองมากที่สุด)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topRooms.map(([roomName, count], index) => (
              <div key={roomName} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                  index === 0 ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500" :
                  index === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" :
                  "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500"
                )}>
                  #{index + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1" title={roomName}>{roomName}</div>
                  <div className="text-xs text-gray-500 mt-1">ถูกจองไปแล้ว <span className="font-semibold text-blue-600 dark:text-blue-400">{count}</span> ครั้ง</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">ห้อง/หัวข้อ</th>
                <th className="px-6 py-4">ผู้จอง</th>
                <th className="px-6 py-4">วัน-เวลา</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">ไม่พบรายการจอง</td></tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 max-w-xs">{booking.roomName}</div>
                      <div className="text-xs text-gray-500 max-w-xs mt-0.5">{booking.topic || "ไม่มีหัวข้อ"}</div>
                      {booking.extraEquipment && <div className="text-[11px] text-orange-600 mt-1">อุปกรณ์: {booking.extraEquipment}</div>}
                      {booking.notes && <div className="text-[11px] text-gray-400 mt-0.5 max-w-xs">หมายเหตุ: {booking.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{booking.userName}</div>
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{booking.department || "ไม่ระบุหน่วยงาน"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{booking.email ? `${booking.email} · ` : ""}{booking.phone}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{booking.participants} คน {booking.participantList && booking.participantList.length > 0 && `(${booking.participantList.length} รายชื่อ)`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-gray-100">{booking.date}</div>
                      <div className="text-xs text-gray-500">{booking.startTime} - {booking.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button 
                            onClick={() => mutation.mutate({ id: booking.id, status: "approved" })}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white shadow hover:bg-green-700 h-8 px-3"
                          >
                            อนุมัติ
                          </button>
                          <button 
                            onClick={() => mutation.mutate({ id: booking.id, status: "rejected" })}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-900/50 h-8 px-3"
                          >
                            ปฏิเสธ
                          </button>
                        </>
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

export default ManageBookings;
