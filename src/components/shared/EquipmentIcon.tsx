import { Monitor, Mic, Tv, Plug, Wifi, PenTool, Video } from "lucide-react";
import { EQUIPMENT_LABELS } from "@/data/mockData";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  projector: Monitor,
  microphone: Mic,
  tv: Tv,
  powerstrip: Plug,
  wifi: Wifi,
  whiteboard: PenTool,
  videoconf: Video,
};

interface EquipmentIconProps {
  type: string;
  showLabel?: boolean;
  className?: string;
}

export const EquipmentIcon = ({ type, showLabel = false, className }: EquipmentIconProps) => {
  const Icon = iconMap[type] || Monitor;
  return (
    <span className={cn("inline-flex items-center gap-1 text-muted-foreground", className)}>
      <Icon className="h-4 w-4" />
      {showLabel && <span className="text-xs">{EQUIPMENT_LABELS[type] || type}</span>}
    </span>
  );
};
