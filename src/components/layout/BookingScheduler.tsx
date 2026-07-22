import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Booking, Room } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, Users, Wifi, Info, CalendarRange, Ban, Clock, CheckCircle } from "lucide-react";

interface BookingSchedulerProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: Date;
  realTimeHH?: string;
  realTimeDate?: string;
  onTimeSlotClick: (room: Room, time: string) => void;
}

const HOURS = [
  '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00'
];

export const BookingScheduler = React.memo(({ rooms, bookings, selectedDate, realTimeHH, realTimeDate, onTimeSlotClick }: BookingSchedulerProps) => {
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  const bookingsByRoom = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      if (b.date === selectedDateStr) {
        if (!map[b.roomId]) map[b.roomId] = [];
        map[b.roomId].push(b);
      }
    });
    return map;
  }, [bookings, selectedDateStr]);

  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const getSlotDetails = (room: Room, time: string) => {
    if (room.status === 'maintenance') {
      return { status: 'maintenance', label: 'ปิดปรับปรุง' };
    }

    const roomBookings = bookingsByRoom[room.id] || [];
    const booking = roomBookings.find(b => time >= b.startTime && time < b.endTime);

    if (booking) {
      if (booking.status === 'approved') {
        return { status: 'booked', label: 'จองแล้ว' };
      }
      if (booking.status === 'pending') {
        return { status: 'pending', label: 'รออนุมัติ' };
      }
    }

    return { status: 'available', label: 'ว่าง' };
  };

  return (
    <div id="booking-scheduler" className="flex flex-col gap-5 mt-6">
      {rooms.map(room => (
        <div key={room.id} className="group">
          {/* Main Card (Header) */}
          <div 
            className="relative bg-gradient-to-r from-[#44a5ff] to-[#3b82f6] dark:from-slate-800 dark:to-slate-900 dark:border dark:border-slate-700/50 rounded-[24px] p-5 shadow-lg flex flex-col xl:flex-row gap-5 transition-all duration-300 w-full min-w-0"
          >
            {/* Room Info Section */}
            <div className="w-full xl:w-[500px] shrink-0 flex flex-col gap-4 bg-slate-800/25 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-[20px] p-5 backdrop-blur-md shadow-sm">
              <div className="flex gap-4 sm:gap-6">
                {/* Room Image */}
                <div 
                  className="w-[160px] h-[100px] sm:w-[220px] sm:h-[130px] rounded-2xl overflow-hidden shrink-0 shadow-sm border border-white/20 dark:border-white/10"
                >
                  <img 
                    src={room.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} 
                    alt={room.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Text Info */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div 
                    className="flex items-start gap-2 cursor-pointer group"
                    onClick={() => toggleRoom(room.id)}
                  >
                    <h3 className="text-[20px] sm:text-[26px] font-bold text-white leading-snug">
                      {room.name}
                    </h3>
                    <ChevronDown className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 text-white/70 transition-transform duration-300 shrink-0 mt-1",
                      expandedRooms[room.id] ? "rotate-180" : ""
                    )} />
                  </div>
                  
                  <div className="mt-3 sm:mt-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-[13px] sm:text-[14px] font-medium bg-black/10 dark:bg-black/30 text-white/95 shadow-sm">
                      {room.capacity} คน • {room.location}
                    </span>
                  </div>

                  {room.status === 'maintenance' ? (
                    <span className="w-fit px-3 py-1.5 mt-3 text-[12px] font-bold bg-rose-500/80 text-white rounded-md border border-rose-400/50 flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" />
                      ปิดปรับปรุง
                    </span>
                  ) : (() => {
                    const activeBooking = bookingsByRoom[room.id]?.find(
                      b => b.status === "approved" && 
                           b.date === realTimeDate && 
                           realTimeHH && 
                           realTimeHH >= b.startTime && 
                           realTimeHH < b.endTime
                    );
                    
                    if (activeBooking) {
                      return (
                        <span className="w-fit px-3 py-1.5 mt-3 text-[12px] font-bold bg-pink-500/90 text-white rounded-md border border-pink-400/60 shadow-[0_0_10px_rgba(236,72,153,0.5)] flex items-center gap-1.5 animate-pulse">
                          <CheckCircle className="w-3.5 h-3.5" />
                          กำลังใช้งาน
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* View Detail Trigger */}
              <button 
                onClick={() => toggleRoom(room.id)}
                className="flex items-center justify-center gap-2 text-[14px] font-medium text-white bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 border border-white/20 dark:border-white/10 rounded-[14px] px-5 py-3 w-fit transition-all duration-200 shadow-sm"
              >
                <span>👇 คลิกเพื่อดูรายละเอียดห้อง</span>
              </button>
            </div>
            
            {/* Time Slots Section */}
            <div className="flex-1 min-w-0 flex items-stretch justify-start xl:justify-end">
              <div className="bg-slate-800/25 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-[24px] p-4 sm:p-5 backdrop-blur-md shadow-sm w-full h-full flex flex-col justify-center">
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-start xl:justify-end w-full">
                  {HOURS.map(hour => {
                  const slot = getSlotDetails(room, hour);
                  
                  let slotClass = "";
                  let textClass = "";
                  let labelClass = "";

                  if (slot.status === 'available') {
                    slotClass = "bg-white/95 dark:bg-slate-700/95 hover:bg-white dark:hover:bg-slate-600 cursor-pointer shadow-md hover:shadow-xl hover:scale-110 active:scale-95 border-white/40 dark:border-slate-500/40 backdrop-blur-md";
                    textClass = "text-[#0275d8] dark:text-sky-400 font-extrabold";
                    labelClass = "text-[#3ea4f9] dark:text-sky-300 font-semibold";
                  } else if (slot.status === 'pending') {
                    slotClass = "bg-amber-100/90 dark:bg-amber-900/50 cursor-not-allowed shadow-md border-white/40 dark:border-amber-700/40 backdrop-blur-md";
                    textClass = "text-amber-700 dark:text-amber-400 font-bold";
                    labelClass = "text-amber-600 dark:text-amber-300/80 font-medium";
                  } else if (slot.status === 'booked') {
                    slotClass = "bg-white/20 dark:bg-slate-800/60 cursor-not-allowed shadow-md border-white/30 dark:border-slate-600/40 backdrop-blur-md";
                    textClass = "text-white dark:text-slate-300 font-semibold";
                    labelClass = "text-white/80 dark:text-slate-400 font-medium";
                  } else if (slot.status === 'maintenance') {
                    slotClass = "bg-black/20 dark:bg-black/40 cursor-not-allowed border-white/10 dark:border-slate-700/30 backdrop-blur-md";
                    textClass = "text-white/50 dark:text-slate-500 font-semibold line-through";
                    labelClass = "text-white/40 dark:text-slate-600 font-medium";
                  }

                  return (
                    <button
                      key={`${room.id}-${hour}`}
                      disabled={slot.status !== 'available'}
                      onClick={() => onTimeSlotClick(room, hour)}
                      className={cn(
                        "w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 ease-out flex-shrink-0 border",
                        slotClass
                      )}
                      title={slot.status === 'available' ? `คลิกเพื่อจองเวลา ${hour}` : undefined}
                    >
                      <span className={cn("text-[17px] sm:text-[19px] leading-tight transition-colors", textClass)}>
                        {hour}
                      </span>
                      <span className={cn("text-[12px] sm:text-[13px] mt-1 transition-colors px-1 text-center w-full truncate", labelClass)}>
                        {slot.label}
                      </span>
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Room Details */}
          <div className={cn(
            "grid transition-all duration-300 ease-in-out",
            expandedRooms[room.id] ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="bg-slate-200/95 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-5 border border-slate-300 dark:border-slate-700/50 shadow-md flex flex-col md:flex-row gap-6 mx-2">
                <div className="w-full md:w-1/4 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 relative border border-slate-300 dark:border-slate-700">
                  <img src={room.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} alt={room.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-bold text-lg leading-tight">{room.name}</h4>
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <h5 className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base mb-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      รายละเอียด
                    </h5>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {room.description || "ไม่มีรายละเอียด"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base mb-2">
                        <Wifi className="w-5 h-5 text-blue-500" />
                        สิ่งอำนวยความสะดวก
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {room.equipment?.map((eq, i) => (
                          <span key={i} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-300 dark:border-slate-600 shadow-sm">
                            {eq}
                          </span>
                        )) || <span className="text-sm text-slate-500">ไม่มีข้อมูล</span>}
                      </div>
                    </div>
                    <div>
                      <h5 className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base mb-2">
                        <Users className="w-5 h-5 text-orange-500" />
                        กฎการใช้งาน
                      </h5>
                      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5 marker:text-blue-500">
                        {room.rules?.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        )) || <li>โปรดรักษาความสะอาด</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

