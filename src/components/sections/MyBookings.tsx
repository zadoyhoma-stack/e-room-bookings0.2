import { useMemo } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BookingCountdown } from "@/components/shared/BookingCountdown";
import { Button } from "@/components/ui/button";
import { CalendarPlus, XCircle, Inbox, LogIn } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Booking } from "@/data/mockData";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface MyBookingsProps {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
  onAddToCalendar: (booking: Booking) => void;
}

export const MyBookings = ({ bookings = [], onCancel, onAddToCalendar }: MyBookingsProps) => {
  const { currentUser, setRole } = useAuth();

  // Filter bookings for the current user
  const userBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(b => b.userId === currentUser.id);
  }, [bookings, currentUser]);

  return (
    <section id="my-bookings" className="relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">สถานะการจองของฉัน</h2>
          <p className="mt-2 text-slate-500">ติดตามคำขอจองห้องประชุมทั้งหมดของคุณ</p>
        </div>

        <GlassCard variant="strong" className="p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="text-sm text-slate-500">
              {currentUser ? `ทั้งหมด ${userBookings.length} รายการ` : "กรุณาเข้าสู่ระบบ"}
            </div>

            <div className="flex items-center gap-2">
              {!currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs rounded-lg"
                  onClick={() => setRole('student')}
                >
                  <LogIn className="mr-1 h-3 w-3" />
                  เข้าสู่ระบบ (นักศึกษา)
                </Button>
              )}
            </div>
          </div>

          {!currentUser ? (
            <div className="text-center py-16 text-slate-400">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600">ยังไม่ได้เข้าสู่ระบบ</p>
              <p className="text-sm mt-1">กดเข้าสู่ระบบเพื่อดูรายการจองของคุณ</p>
            </div>
          ) : userBookings.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-600">ยังไม่มีรายการจอง</p>
              <p className="text-sm mt-1">เริ่มจองห้องประชุมโดยค้นหาห้องว่างด้านบน</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* --- Desktop View (Table) --- */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-700">วันที่</TableHead>
                      <TableHead className="text-slate-700">เวลา</TableHead>
                      <TableHead className="text-slate-700">ห้อง</TableHead>
                      <TableHead className="text-slate-700">หัวข้อ</TableHead>
                      <TableHead className="text-slate-700">สถานะ</TableHead>
                      <TableHead className="text-slate-700 text-right">
                        การทำรายการ
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {userBookings.map((b) => {
                      const canCancel = b.status === "pending" || b.status === "approved";
                      const displayDate = b.date.includes('-') 
                        ? format(new Date(b.date), 'd MMM yyyy', { locale: th })
                        : b.date;

                      return (
                        <TableRow key={b.id}>
                          <TableCell className="text-slate-800 text-sm font-medium">
                            {displayDate}
                          </TableCell>
                          <TableCell className="text-slate-700 text-sm">
                            {b.startTime} – {b.endTime}
                          </TableCell>
                          <TableCell className="text-slate-800 text-sm font-medium">
                            {b.roomName}
                          </TableCell>
                          <TableCell className="text-slate-700 text-sm">
                            {b.topic || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1.5">
                              <StatusBadge status={b.status} />
                              <BookingCountdown date={b.date} startTime={b.startTime} endTime={b.endTime} status={b.status} />
                            </div>
                          </TableCell>

                          <TableCell className="text-right space-x-1">
                            {canCancel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onCancel(b)}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                ยกเลิก
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => onAddToCalendar(b)}
                            >
                              <CalendarPlus className="mr-1 h-3 w-3" /> ปฏิทิน
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* --- Mobile View (Cards) --- */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {userBookings.map((b) => {
                  const canCancel = b.status === "pending" || b.status === "approved";
                  const displayDate = b.date.includes('-') 
                    ? format(new Date(b.date), 'd MMM yyyy', { locale: th })
                    : b.date;

                  return (
                    <div key={b.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-slate-800">{b.roomName}</div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={b.status} />
                          <BookingCountdown date={b.date} startTime={b.startTime} endTime={b.endTime} status={b.status} />
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">วันที่:</span>
                          <span className="font-medium">{displayDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">เวลา:</span>
                          <span className="font-medium">{b.startTime} – {b.endTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">หัวข้อ:</span>
                          <span className="truncate max-w-[150px] text-right">{b.topic || "-"}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                            onClick={() => onCancel(b)}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            ยกเลิก
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-8 px-2"
                          onClick={() => onAddToCalendar(b)}
                        >
                          <CalendarPlus className="mr-1 h-3 w-3" /> ปฏิทิน
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
};
