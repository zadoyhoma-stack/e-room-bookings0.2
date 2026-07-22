import { Room } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EquipmentIcon } from "@/components/shared/EquipmentIcon";
import { Users, MapPin } from "lucide-react";

interface RoomDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

export const RoomDetailModal = ({ open, onOpenChange, room }: RoomDetailModalProps) => {
  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-2xl border-white/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{room.name}</DialogTitle>
          <DialogDescription className="sr-only">รายละเอียดห้องประชุม</DialogDescription>
        </DialogHeader>

        {/* Photo placeholder */}
        <div className="h-44 rounded-xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
          <span className="text-5xl">🏢</span>
        </div>

        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-card-foreground">
              <Users className="h-4 w-4" /> รองรับ {room.capacity} คน
            </div>
            <StatusBadge status={room.status} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {room.location}
          </div>

          <p className="text-sm text-card-foreground/80">{room.description}</p>

          <div>
            <h4 className="text-sm font-semibold text-card-foreground mb-2">อุปกรณ์ในห้อง</h4>
            <div className="flex flex-wrap gap-2">
              {room.equipment.map(eq => (
                <EquipmentIcon key={eq} type={eq} showLabel className="bg-muted/50 px-3 py-1 rounded-lg text-card-foreground" />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-card-foreground mb-2">กฎการใช้งาน</h4>
            <ul className="space-y-1">
              {room.rules.map((rule, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span> {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
