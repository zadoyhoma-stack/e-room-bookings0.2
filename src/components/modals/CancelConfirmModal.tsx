import React, { useState } from "react";
import { Booking } from "@/data/mockData";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";

interface CancelConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onConfirm: () => void;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  open,
  onOpenChange,
  booking,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      variant="danger"
      title="ยืนยันการยกเลิกการจอง"
      description="การยกเลิกนี้จะทำให้ช่วงเวลาดังกล่าวกลับมาเปิดให้ผู้ใช้อื่นจองได้"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl font-bold border-slate-200 text-slate-600 dark:text-slate-300 w-full sm:w-auto"
          >
            ไม่ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold w-full sm:w-auto shadow-md shadow-rose-600/20"
          >
            {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันยกเลิก"}
          </Button>
        </>
      }
    >
      <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center space-y-2">
        <h4 className="font-bold text-rose-900 dark:text-rose-200 text-base">
          {booking.roomName}
        </h4>
        <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
          วันที่ {booking.date} | เวลา {booking.startTime} – {booking.endTime} น.
        </p>
      </div>
    </AppModal>
  );
};
