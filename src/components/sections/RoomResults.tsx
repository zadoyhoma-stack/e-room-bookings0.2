import { Room } from "@/data/mockData";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EquipmentIcon } from "@/components/shared/EquipmentIcon";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Eye, Send } from "lucide-react";

interface RoomResultsProps {
  rooms: Room[];
  onViewDetails: (room: Room) => void;
  onRequestBooking: (room: Room) => void;
}

export const RoomResults = ({ rooms, onViewDetails, onRequestBooking }: RoomResultsProps) => (
  <div className="mt-8 mb-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">รายละเอียดห้องประชุม</h2>
        <p className="mt-1 text-sm text-slate-500">ข้อมูลห้องประชุมทั้ง 15 ห้อง</p>
      </div>
    </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map(room => (
          <GlassCard key={room.id} variant="strong" className="p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col glass-panel border-white/60">
            {/* Photo placeholder */}
            <div className="h-36 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
              <span className="text-4xl">🏢</span>
            </div>

            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{room.name}</h3>
              <StatusBadge status={room.status} />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
              <Users className="h-3.5 w-3.5" /> {room.capacity} คน
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
              <MapPin className="h-3.5 w-3.5" /> {room.location}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {room.equipment.slice(0, 4).map(eq => (
                <EquipmentIcon key={eq} type={eq} showLabel className="text-xs bg-slate-100 px-2 py-0.5 rounded-lg" />
              ))}
              {room.equipment.length > 4 && (
                <span className="text-xs text-slate-400">+{room.equipment.length - 4}</span>
              )}
            </div>

            <div className="mt-auto flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" onClick={() => onViewDetails(room)}>
                <Eye className="mr-1 h-3 w-3" /> ดูรายละเอียด
              </Button>
              <Button
                size="sm"
                className="flex-1 rounded-xl text-xs"
                disabled={room.status !== 'available'}
                onClick={() => onRequestBooking(room)}
              >
                <Send className="mr-1 h-3 w-3" /> ส่งคำขอจอง
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
  </div>
);
