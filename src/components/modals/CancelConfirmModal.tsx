import { Booking } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CancelConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: () => void;
}

export const CancelConfirmModal = ({ open, onOpenChange, booking, onConfirm }: CancelConfirmModalProps) => {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-2xl border-white/30 max-w-sm">
        <DialogHeader className="items-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <DialogTitle className="text-card-foreground text-center">ยืนยันยกเลิกการจอง</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            คุณต้องการยกเลิกการจอง "{booking.roomName}" ในวันที่ {booking.date} เวลา {booking.startTime} – {booking.endTime} หรือไม่?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl flex-1">ไม่ยกเลิก</Button>
          <Button variant="destructive" onClick={onConfirm} className="rounded-xl flex-1">ยืนยันยกเลิก</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
