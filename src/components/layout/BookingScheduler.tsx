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
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00'
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
    setExpandedRooms(prev => {
      const isExpanding = !prev[roomId];
      if (isExpanding) {
        setTimeout(() => {
          const el = document.getElementById(`room-detail-${roomId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 200);
      }
      return {
        ...prev,
        [roomId]: isExpanding
      };
    });
  };

  const getSlotDetails = (room: Room, time: string) => {
    if (room.status === 'maintenance') {
      return { status: 'maintenance', label: 'ปิดปรับปรุง' };
    }

    const roomBookings = bookingsByRoom[room.id] || [];
    // กรองเฉพาะ Booking ที่แอคทีฟ — pending + approved
    const activeBookings = roomBookings.filter(b => 
      b.status === 'pending' || b.status === 'approved'
    );
    
    const booking = activeBookings.find(b => {
      const [slotH, slotM] = time.split(':').map(Number);
      const slotStart = slotH * 60 + slotM;
      const slotEnd = (slotH + 1) * 60 + slotM;

      const [bStartH, bStartM] = (b.startTime || '00:00').split(':').map(Number);
      const bStart = bStartH * 60 + bStartM;
      const [bEndH, bEndM] = (b.endTime || '00:00').split(':').map(Number);
      const bEnd = bEndH * 60 + bEndM;

      return slotStart < bEnd && slotEnd > bStart;
    });

    if (booking) {
      if (booking.status === 'approved') {
        return { status: 'booked', label: 'จองแล้ว' };
      }
      if (booking.status === 'pending') {
        return { status: 'pending', label: 'รออนุมัติ' };
      }
    }

    // ตรวจสอบว่าช่วงเวลานี้ผ่านไปแล้วในวันปัจจุบันหรือไม่
    if (realTimeDate && selectedDateStr === realTimeDate && realTimeHH) {
      const [slotH, slotM] = time.split(':').map(Number);
      const slotEndMins = (slotH + 1) * 60 + slotM;
      const [nowH, nowM] = realTimeHH.split(':').map(Number);
      const nowMins = nowH * 60 + nowM;
      if (slotEndMins <= nowMins) {
        return { status: 'maintenance', label: 'ผ่านไปแล้ว' };
      }
    }

    return { status: 'available', label: 'ว่าง' };
  };

  return (
    <div id="booking-scheduler" className="flex flex-col gap-4 mt-2">
      {rooms.map(room => (
        <div key={room.id} className="group w-full">
          {/* Main Card (Header) */}
          <div 
            className="relative bg-gradient-to-r from-[#44a5ff] to-[#3b82f6] dark:from-slate-800 dark:to-slate-900 dark:border dark:border-slate-700/50 rounded-2xl p-4 shadow-lg border border-[#3b82f6]/20 flex flex-col xl:flex-row gap-4 transition-all duration-300 w-full min-w-0"
          >
            {/* Room Info Section */}
            <div className="w-full xl:w-[500px] shrink-0 flex flex-col gap-3 bg-slate-800/25 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
              <div className="flex gap-4 sm:gap-6">
                {/* Room Image */}
                <div 
                  className="w-[120px] h-[80px] sm:w-[160px] sm:h-[100px] rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/20 dark:border-white/10"
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
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
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
              <div className="bg-slate-800/25 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 rounded-xl p-3 sm:p-4 shadow-sm w-full h-full flex flex-col justify-center">
                
                {/* Booking Hint */}
                <div className="w-full flex justify-start xl:justify-end mb-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 dark:bg-blue-900/40 rounded-full text-[12px] sm:text-[13px] font-bold text-blue-50 dark:text-blue-200 border border-blue-400/30 shadow-inner">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-100"></span>
                    </span>
                    👉 จองห้องที่นี่ กดที่ช่องสี่เหลี่ยมสีขาวได้เลย
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4 justify-start xl:justify-end w-full">
                  {HOURS.map(hour => {
                  const slot = getSlotDetails(room, hour);
                  
                  let slotClass = "";
                  let textClass = "";
                  let labelClass = "";

                  if (slot.status === 'available') {
                    slotClass = "bg-white/95 dark:bg-slate-700/95 hover:bg-white dark:hover:bg-slate-600 cursor-pointer shadow-md hover:shadow-xl hover:scale-110 active:scale-95 border-white/40 dark:border-slate-500/40";
                    textClass = "text-[#0275d8] dark:text-sky-400 font-extrabold";
                    labelClass = "text-[#3ea4f9] dark:text-sky-300 font-semibold";
                  } else if (slot.status === 'pending') {
                    slotClass = "bg-slate-300/80 dark:bg-slate-600/50 cursor-not-allowed shadow-inner border-slate-400/50 dark:border-slate-500/40";
                    textClass = "text-slate-600 dark:text-slate-400 font-bold";
                    labelClass = "text-slate-500 dark:text-slate-400/80 font-medium";
                  } else if (slot.status === 'booked') {
                    slotClass = "bg-slate-400/90 dark:bg-slate-700/80 cursor-not-allowed shadow-inner border-slate-500/50 dark:border-slate-600/40";
                    textClass = "text-slate-100 dark:text-slate-300 font-semibold line-through";
                    labelClass = "text-slate-200 dark:text-slate-400 font-medium";
                  } else if (slot.status === 'maintenance') {
                    slotClass = "bg-black/20 dark:bg-black/40 cursor-not-allowed border-white/10 dark:border-slate-700/30";
                    textClass = "text-white/50 dark:text-slate-500 font-semibold line-through";
                    labelClass = "text-white/40 dark:text-slate-600 font-medium";
                  }

                  return (
                    <button
                      key={`${room.id}-${hour}`}
                      disabled={slot.status !== 'available'}
                      onClick={() => onTimeSlotClick(room, hour)}
                      className={cn(
                        "w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 ease-out flex-shrink-0 border",
                        slotClass
                      )}
                      title={slot.status === 'available' ? `คลิกเพื่อจองเวลา ${hour}` : undefined}
                    >
                      <span className={cn("text-[15px] sm:text-[16px] leading-tight transition-colors", textClass)}>
                        {hour}
                      </span>
                      <span className={cn("text-[11px] sm:text-[12px] mt-1 transition-colors px-1 text-center w-full truncate", labelClass)}>
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
          <div id={`room-detail-${room.id}`} className={cn(
            "grid transition-all duration-500 ease-in-out",
            expandedRooms[room.id] ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          )}>
            <div className="overflow-hidden">
              <div className="relative overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col lg:flex-row gap-8 mx-0 sm:mx-2 group/detail">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/10 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/10 dark:bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
                
                <div className="w-full lg:w-[320px] h-[240px] rounded-[20px] overflow-hidden shrink-0 relative border border-white/40 dark:border-white/10 shadow-lg group-hover/detail:shadow-xl transition-all duration-500">
                  <img src={room.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/detail:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="inline-block px-3 py-1 mb-2.5 bg-blue-500/80 backdrop-blur-md rounded-md text-[11px] font-bold tracking-wider uppercase shadow-sm">
                      {room.location}
                    </span>
                    <h4 className="font-bold text-2xl leading-tight text-white/95">{room.name}</h4>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-5 relative z-10">
                  {/* Details section */}
                  <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[16px] p-5 sm:p-6 border border-white/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                    <h5 className="flex items-center gap-3 text-slate-800 dark:text-slate-100 font-bold text-[17px] mb-2.5">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <Info className="w-4 h-4" />
                      </div>
                      รายละเอียด
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 text-[14.5px] leading-relaxed pl-[36px]">
                      {room.description || "ไม่มีรายละเอียด"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Facilities */}
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[16px] p-5 border border-white/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                      <h5 className="flex items-center gap-3 text-slate-800 dark:text-slate-100 font-bold text-[17px] mb-3.5">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <Wifi className="w-4 h-4" />
                        </div>
                        สิ่งอำนวยความสะดวก
                      </h5>
                      <div className="flex flex-wrap gap-2 pl-[36px]">
                        {room.equipment?.map((eq, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-700/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-[13px] font-medium border border-slate-200/50 dark:border-slate-600/50 shadow-sm transition-colors cursor-default">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                            {eq}
                          </span>
                        )) || <span className="text-[14px] text-slate-500 pl-[36px]">ไม่มีข้อมูล</span>}
                      </div>
                    </div>
                    
                    {/* Rules */}
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[16px] p-5 border border-white/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                      <h5 className="flex items-center gap-3 text-slate-800 dark:text-slate-100 font-bold text-[17px] mb-3.5">
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
                          <Users className="w-4 h-4" />
                        </div>
                        กฎการใช้งาน
                      </h5>
                      <ul className="text-[14px] text-slate-600 dark:text-slate-300 space-y-2.5 pl-[36px]">
                        {room.rules?.map((rule, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                            <span className="leading-relaxed">{rule}</span>
                          </li>
                        )) || (
                          <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                            <span className="leading-relaxed">โปรดรักษาความสะอาด</span>
                          </li>
                        )}
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

