import { format } from "date-fns";
import { mockRooms, Booking, TimeSlot } from "@/data/mockData";
import { GlassCard } from "@/components/shared/GlassCard";
import { TimeSlotChip } from "@/components/shared/TimeSlotChip";

export const TodayAvailability = ({ bookings = [] }: { bookings?: Booking[] }) => {
  const roomsToShow = mockRooms.filter(r => r.status !== 'maintenance');

  const getSlotsForRoom = (roomId: string): TimeSlot[] => {
    const hours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const roomBookings = bookings.filter(b => b.roomId === roomId && (b.status === 'approved' || b.status === 'pending' || b.status === 'completed') && b.date === todayStr);

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    return hours.map(time => {
      const isBooked = roomBookings.some(b => {
        if (time < b.startTime || time >= b.endTime) return false;
        
        const [endH, endM] = b.endTime.split(':').map(Number);
        const endTotalMinutes = endH * 60 + endM;
        if (currentTotalMinutes >= endTotalMinutes) return false;
        
        return true;
      });
      return {
        time,
        status: isBooked ? 'booked' : 'available',
        bookingInfo: isBooked ? 'จองแล้ว' : undefined,
      };
    });
  };

  return (
    <section id="calendar" className="py-20 bg-gradient-to-b from-white to-blue-50/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-slate-800">ตารางห้องว่างวันนี้</h2>
          <p className="mt-2 text-slate-500 mb-6">ดูสถานะห้องประชุมแบบเรียลไทม์ และวางแผนการจองของคุณ</p>
        </div>

        <div className="space-y-4">
          {roomsToShow.map(room => {
            const slots = getSlotsForRoom(room.id);
            return (
              <GlassCard key={room.id} variant="strong" className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="sm:w-48 shrink-0">
                    <h3 className="font-semibold text-slate-800 text-sm">{room.name}</h3>
                    <p className="text-xs text-slate-500">{room.capacity} คน • {room.location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {slots.map(slot => (
                      <TimeSlotChip key={slot.time} time={slot.time} status={slot.status} label={slot.status === 'booked' ? 'จองแล้ว' : 'ว่าง'} />
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
