import React from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  open,
  onOpenChange,
  title = "ฟีเจอร์กำลังอยู่ระหว่างพัฒนา (Coming Soon)",
}) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      variant="info"
      icon={<Construction className="w-6 h-6" />}
      title={title}
      description="ระบบกำลังพัฒนายกระดับฟังก์ชันนี้ จะเปิดให้บริการในเวอร์ชันถัดไป"
      footer={
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-md shadow-indigo-600/20"
        >
          รับทราบ
        </Button>
      }
    >
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-center">
        <p className="text-xs text-indigo-900 dark:text-indigo-200 font-semibold">
          ขออภัยในความไม่สะดวก ทางทีมพัฒนากำลังเร่งปรับปรุงระบบเพื่อเพิ่มประสิทธิภาพที่ดีที่สุด
        </p>
      </div>
    </AppModal>
  );
};
