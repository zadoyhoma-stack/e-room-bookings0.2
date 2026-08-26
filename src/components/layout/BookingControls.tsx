import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Room, Booking } from "@/data/mockData";

interface BookingControlsProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
  rooms: Room[];
  bookings: Booking[];
}

export const BookingControls = ({ selectedDate, onDateSelect, selectedRoomId, onRoomSelect, rooms, bookings }: BookingControlsProps) => {
  return (
    <div className="relative p-5 sm:p-6 rounded-[16px] shadow-lg shadow-blue-500/20 mb-4 transition-all overflow-hidden bg-gradient-to-br from-[#1877f2] via-[#2181f7] to-[#4599ff] dark:bg-[#242526] border border-blue-400/20">
      {/* Decorative background effects */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-[#80b3ff] opacity-20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
            <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-[12px] text-white shadow-sm border border-white/20">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            ตารางการจองห้อง
          </h1>
          <p className="text-white/95 mt-2.5 text-[13.5px] sm:text-[14.5px] font-medium ml-1 flex items-center gap-2 drop-shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
            </span>
            เลือกช่วงเวลาที่ต้องการ แล้วคลิกช่องว่างเพื่อดำเนินการจองทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-semibold bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 rounded-xl h-11 sm:h-12 px-4 sm:px-5 text-[14px] sm:text-[15px] text-white min-w-[200px] sm:min-w-[240px] transition-all shadow-sm hover:shadow-md">
                <CalendarIcon className="mr-2.5 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
                {selectedDate ? format(selectedDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-700 shadow-xl" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && onDateSelect(d)} initialFocus className="bg-white dark:bg-[#242526] p-3" />
            </PopoverContent>
          </Popover>

          <Select value={selectedRoomId} onValueChange={onRoomSelect}>
            <SelectTrigger className="w-[180px] sm:w-[240px] bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 rounded-xl h-11 sm:h-12 px-4 sm:px-5 text-[14px] sm:text-[15px] text-white font-semibold transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-white/50 ring-offset-0">
              <SelectValue placeholder="ทุกโซน/ทุกชั้น" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl max-h-[400px] border-slate-100 bg-white">
              <SelectItem value="all" className="font-bold text-cyan-700 py-3 cursor-pointer">
                ทุกโซน/ทุกชั้น
              </SelectItem>
              <SelectSeparator className="bg-slate-100" />
              
              {[1, 2, 3, 4, 5, 6].map(floorNumber => {
                const floorRooms = rooms.filter(r => r.location.includes(`ชั้น ${floorNumber}`));
                return (
                  <SelectItem 
                    key={floorNumber} 
                    value={String(floorNumber)} 
                    className="py-3 cursor-pointer hover:bg-cyan-50 focus:bg-cyan-50 transition-colors font-semibold text-slate-700"
                  >
                    ชั้น {floorNumber} {floorRooms.length > 0 ? `(มี ${floorRooms.length} ห้อง)` : '(ไม่มีห้อง)'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
