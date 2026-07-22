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
    <div className="relative p-5 sm:p-6 rounded-2xl shadow-2xl shadow-slate-900/40 border border-cyan-500/20 mb-2 transition-all overflow-hidden bg-gradient-to-br from-cyan-600 via-slate-800 to-slate-950 group">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-[80px] group-hover:bg-cyan-400/20 transition-colors duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
            </div>
            ตารางการจองห้อง
          </h1>
          <p className="text-cyan-100 mt-3 text-sm sm:text-base font-semibold ml-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            เลือกช่วงเวลาที่ต้องการ แล้วคลิกช่องว่างเพื่อดำเนินการจองทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-bold bg-white/10 border-white/20 hover:bg-white/20 hover:border-cyan-400 rounded-xl h-11 sm:h-12 px-4 sm:px-5 text-sm sm:text-base text-white min-w-[200px] sm:min-w-[240px] shadow-lg shadow-black/20 transition-all hover:shadow-cyan-500/20 backdrop-blur-md">
                <CalendarIcon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                {selectedDate ? format(selectedDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-slate-100 shadow-2xl" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && onDateSelect(d)} initialFocus className="bg-white p-3" />
            </PopoverContent>
          </Popover>

          <Select value={selectedRoomId} onValueChange={onRoomSelect}>
            <SelectTrigger className="w-[180px] sm:w-[240px] bg-white/10 border-2 border-white/20 hover:border-cyan-400 rounded-xl h-11 sm:h-12 px-4 sm:px-5 text-sm sm:text-base text-white font-bold shadow-lg shadow-black/20 hover:shadow-cyan-500/20 transition-all focus:ring-4 focus:ring-cyan-500/30 ring-offset-0 backdrop-blur-md">
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
