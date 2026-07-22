import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ReportSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportSuccessModal = ({ open, onOpenChange }: ReportSuccessModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] text-center p-8 bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader className="flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <DialogTitle className="text-2xl font-bold text-slate-800">ส่งรายงานสำเร็จแล้ว</DialogTitle>
          <DialogDescription className="text-slate-500 text-base mt-2">
            ขอขอบคุณสำหรับข้อมูล ทางเจ้าหน้าที่จะดำเนินการตรวจสอบและแก้ไขโดยเร็วที่สุด
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-6">
          <Button onClick={() => onOpenChange(false)} className="px-8 rounded-xl">ตกลง</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
