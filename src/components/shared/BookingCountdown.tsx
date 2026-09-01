import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCountdownProps {
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export const BookingCountdown = ({ date, startTime, endTime, status }: BookingCountdownProps) => {
  const calculateTime = () => {
    if (status === 'rejected' || status === 'cancelled') {
      return { text: 'ยกเลิกแล้ว', isOngoing: false, isEnded: true };
    }

    const now = new Date();
    // Parse start and end time securely
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { text: 'เวลาไม่ถูกต้อง', isOngoing: false, isEnded: true };
    }

    if (now >= end || status === 'completed') {
      return { text: 'หมดเวลา', isOngoing: false, isEnded: true };
    }

    if (now >= start && now < end) {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const h = String(hours).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');
      
      const text = hours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
      return { text: `ระยะเวลาการใช้งานคงเหลือ ${text}`, isOngoing: true, isEnded: false };
    }

    const diff = start.getTime() - now.getTime();
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        return { text: `เริ่มใน ${days} วัน`, isOngoing: false, isEnded: false };
      }
      const h = String(hours).padStart(2, '0');
      const m = String(minutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');
      
      return { text: `-${hours > 0 ? `${h}:` : ''}${m}:${s}`, isOngoing: false, isEnded: false };
    }
    
    return { text: 'หมดเวลา', isOngoing: false, isEnded: true };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTime);

  useEffect(() => {
    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [date, startTime, endTime, status]);

  if (!timeLeft.text) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-sm transition-colors tracking-widest mt-1",
        timeLeft.isEnded
          ? "bg-slate-100 text-slate-400 border border-slate-200"
          : timeLeft.isOngoing
          ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner"
          : "bg-slate-100 text-slate-600 border border-slate-200"
      )}
    >
      {!timeLeft.isEnded && <Clock className={cn("h-3.5 w-3.5", timeLeft.isOngoing ? "text-emerald-500" : "text-slate-400")} />}
      <span>{timeLeft.text}</span>
    </div>
  );
};
