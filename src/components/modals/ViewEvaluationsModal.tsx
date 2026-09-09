import React from "react";
import { AppModal } from "@/components/ui/AppModal";
import ViewEvaluations from "@/pages/admin/ViewEvaluations";
import { Star } from "lucide-react";

interface ViewEvaluationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewEvaluationsModal: React.FC<ViewEvaluationsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      variant="info"
      icon={<Star className="w-6 h-6 text-amber-500" />}
      title="ผลการประเมินความพึงพอใจการใช้งานระบบ"
      description="รายการประเมินและข้อเสนอแนะทั้งหมดจากผู้ใช้งานระบบ ARIT E-ROOMs"
      showCloseButton
    >
      <ViewEvaluations />
    </AppModal>
  );
};
