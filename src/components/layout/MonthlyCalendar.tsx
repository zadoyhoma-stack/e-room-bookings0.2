import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface MonthlyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  bookings: Booking[];
}

export const MonthlyCalendar = ({ selectedDate, onSelectDate, bookings }: MonthlyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  return (
    <div className="glass-panel p-6 mb-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {format(currentMonth, 'MMMM yyyy', { locale: th })}
          </h2>
          <p className="text-sm text-slate-500 mt-1">คลิกเลือกวันที่บนปฏิทินเพื่อดูตารางห้องว่างและทำการจอง</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors bg-white shadow-sm border border-slate-100">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors bg-white shadow-sm border border-slate-100">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 lg:gap-4 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-slate-500 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 lg:gap-4">
        {daysInMonth.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBookings = bookings.filter(b => b.date === dateStr && b.status === 'approved');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={idx}
              onClick={() => {
                onSelectDate(day);
                if (!isSameMonth(day, currentMonth)) {
                  setCurrentMonth(startOfMonth(day));
                }
                setTimeout(() => {
                  document.getElementById('booking-scheduler')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
              }}
              className={cn(
                "h-[80px] sm:h-[100px] p-2 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center relative group",
                !isCurrentMonth ? "opacity-40" : "",
                isSelected ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20 scale-105 z-10" : "border-slate-200/60 bg-white/50 hover:border-blue-300 hover:bg-white hover:shadow-lg hover:-translate-y-1",
                isToday && !isSelected ? "border-blue-300 bg-blue-50/30" : ""
              )}
            >
              <span className={cn(
                "text-lg sm:text-xl font-bold mb-1 transition-colors",
                isSelected ? "text-blue-700" : "text-slate-700 group-hover:text-blue-600",
                isToday && !isSelected ? "text-blue-600" : ""
              )}>
                {format(day, 'd')}
              </span>
              
              {isToday && <span className="absolute top-2 right-2 text-[10px] font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-md hidden sm:block">วันนี้</span>}

              {dayBookings.length > 0 && (
                <div className="absolute bottom-2 w-full flex justify-center gap-1">
                  {dayBookings.slice(0, 3).map((_, i) => (
                    <div key={i} className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", isSelected ? "bg-blue-500" : "bg-rose-400 group-hover:bg-rose-500")} />
                  ))}
                  {dayBookings.length > 3 && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
