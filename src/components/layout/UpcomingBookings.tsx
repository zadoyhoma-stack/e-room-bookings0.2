import { format, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { Booking } from "@/data/mockData";
import { Clock, MapPin, CalendarDays, MoreVertical } from "lucide-react";

interface UpcomingBookingsProps {
  myBookings: Booking[];
}

export const UpcomingBookings = ({ myBookings }: UpcomingBookingsProps) => {
  // Sort by date and time
  const sortedBookings = [...myBookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const getSection = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "วันนี้";
    if (isTomorrow(date)) return "พรุ่งนี้";
    if (isThisWeek(date)) return "สัปดาห์นี้";
    return "ถัดไป";
  };

  const grouped = sortedBookings.reduce((acc, booking) => {
    const section = getSection(booking.date);
    if (!acc[section]) acc[section] = [];
    acc[section].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const sections = ["วันนี้", "พรุ่งนี้", "สัปดาห์นี้", "ถัดไป"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">การจองของฉัน</h2>
          <p className="text-sm text-slate-500">ตารางการใช้งานห้องประชุม</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 pb-20">
        {myBookings.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-3">
              <CalendarDays className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">ยังไม่มีการจองในขณะนี้</p>
          </div>
        ) : (
          sections.map(section => {
            if (!grouped[section] || grouped[section].length === 0) return null;

            return (
              <div key={section} className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 sticky top-0 bg-white/80 backdrop-blur py-1 z-10">{section}</h3>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {grouped[section].map((booking) => (
                    <div key={booking.id} className="relative flex items-start group">
                      <div className="absolute left-0 mt-2 ml-5 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 group-hover:scale-125 transition-transform" />
                      
                      <div className="w-full ml-10 glass-panel p-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-800 truncate pr-4">{booking.topic || "การประชุม"}</h4>
                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            {booking.roomName}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            {format(parseISO(booking.date), "d MMM", { locale: th })} | {booking.startTime} - {booking.endTime}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            booking.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {booking.status === 'approved' ? 'อนุมัติแล้ว' :
                             booking.status === 'pending' ? 'รออนุมัติ' : 'ยกเลิก'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
