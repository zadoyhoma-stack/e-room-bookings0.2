import React from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";

interface ReportSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportSuccessModal: React.FC<ReportSuccessModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      variant="success"
      title="ส่งรายงานสำเร็จแล้ว"
      description="ทางเจ้าหน้าที่จะดำเนินการตรวจสอบและแก้ไขปัญหาให้โดยเร็วที่สุด"
      footer={
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8 w-full sm:w-auto shadow-md shadow-emerald-600/20"
        >
          เข้าใจแล้ว
        </Button>
      }
    >
      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center">
        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
          ขอขอบคุณสำหรับการแจ้งข้อมูล ความคิดเห็นของคุณช่วยให้เราปรับปรุงบริการให้ดียิ่งขึ้น
        </p>
      </div>
    </AppModal>
  );
};
