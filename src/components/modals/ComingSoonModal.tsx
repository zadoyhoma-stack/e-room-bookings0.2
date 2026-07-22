import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export const ComingSoonModal = ({ open, onOpenChange, title = "Coming Soon" }: ComingSoonModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="glass-card rounded-2xl border-white/30 max-w-sm text-center">
      <DialogHeader className="items-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Construction className="h-7 w-7 text-primary" />
        </div>
        <DialogTitle className="text-card-foreground">{title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา จะเปิดให้ใช้งานเร็ว ๆ นี้
        </DialogDescription>
      </DialogHeader>
      <Button onClick={() => onOpenChange(false)} className="mt-2 rounded-xl">
        ตกลง
      </Button>
    </DialogContent>
  </Dialog>
);
