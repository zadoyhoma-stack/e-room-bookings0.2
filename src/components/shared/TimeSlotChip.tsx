import { cn } from "@/lib/utils";

interface TimeSlotChipProps {
  time: string;
  status: 'available' | 'booked';
  label?: string;
  className?: string;
}

export const TimeSlotChip = ({ time, status, label, className }: TimeSlotChipProps) => (
  <div className={cn(
    'px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200',
    status === 'available'
      ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 backdrop-blur-sm'
      : 'bg-rose-50/80 text-rose-600 border-rose-200/60 backdrop-blur-sm',
    className
  )}>
    <div className="font-semibold">{time}</div>
    {label && <div className="text-[10px] opacity-75 mt-0.5">{label}</div>}
  </div>
);
