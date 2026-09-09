import React from "react";
import { Room } from "@/data/mockData";
import { AppModal } from "@/components/ui/AppModal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EquipmentIcon } from "@/components/shared/EquipmentIcon";
import { Users, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoomDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  open,
  onOpenChange,
  room,
}) => {
  if (!room) return null;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      variant="info"
      icon={<Building2 className="w-6 h-6" />}
      title={room.name}
      description={`สถานที่: ${room.location} | ความจุรองรับ ${room.capacity} คน`}
      footer={
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-md shadow-indigo-500/20"
        >
          ปิดหน้าต่าง
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Photo / Banner Container */}
        {(room.image || room.imageUrl) ? (
          <div className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
            <img
              src={room.image || room.imageUrl}
              alt={room.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-40 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center">
            <span className="text-5xl">🏢</span>
          </div>
        )}

        {/* Status & Quick Specs */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              รองรับ {room.capacity} คน
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-4 h-4 text-rose-500" />
              {room.location}
            </span>
          </div>
          <StatusBadge status={room.status} />
        </div>

        {/* Description */}
        {room.description && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              รายละเอียดห้องประชุม
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl">
              {room.description}
            </p>
          </div>
        )}

        {/* Equipment */}
        {room.equipment && room.equipment.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              อุปกรณ์ที่มีให้บริการ
            </h4>
            <div className="flex flex-wrap gap-2">
              {room.equipment.map((eq) => (
                <EquipmentIcon
                  key={eq}
                  type={eq}
                  showLabel
                  className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60"
                />
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        {room.rules && room.rules.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              กฎและข้อปฏิบัติตามการใช้งาน
            </h4>
            <ul className="space-y-1.5">
              {room.rules.map((rule, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl"
                >
                  <span className="text-indigo-600 font-bold">•</span> {rule}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppModal>
  );
};
