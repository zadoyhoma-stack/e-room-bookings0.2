import { Dialog, DialogContent } from "@/components/ui/dialog";
import ViewEvaluations from "@/pages/admin/ViewEvaluations";

interface ViewEvaluationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewEvaluationsModal = ({ open, onOpenChange }: ViewEvaluationsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/30 rounded-2xl">
        <ViewEvaluations />
      </DialogContent>
    </Dialog>
  );
};
