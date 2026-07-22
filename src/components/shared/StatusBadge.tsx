import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/data/mockData";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const colorMap: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    occupied: 'bg-rose-100 text-rose-700 border-rose-200',
    maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
    pending: 'bg-sky-100 text-sky-700 border-sky-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
      colorMap[status] || 'bg-gray-100 text-gray-600',
      className
    )}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};
