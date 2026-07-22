import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockRooms } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Upload } from "lucide-react";
import * as ds from "@/services/dataService";

interface ReportProblemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ReportProblemModal = ({ open, onOpenChange, onSuccess }: ReportProblemModalProps) => {
  const { toast } = useToast();
  const [room, setRoom] = useState('');
  const [problemType, setProblemType] = useState('');
  const [details, setDetails] = useState('');
  const [urgency, setUrgency] = useState('');
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'รูปภาพต้องมีขนาดไม่เกิน 2MB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !problemType || !details) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" });
      return;
    }

    try {
      ds.createProblem({
        roomId: room,
        details: details,
        problemType: problemType,
        urgency: urgency as any,
        rating: rating,
        image: image,
      });

      setRoom(''); setProblemType(''); setDetails(''); setUrgency(''); setRating(0); setImage('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Report problem error:", err);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถส่งรายงานได้", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader className="pt-6 px-6 pb-2 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-800">รายงานปัญหา</DialogTitle>
          <DialogDescription className="text-slate-500">
            แจ้งปัญหาเกี่ยวกับห้องประชุมหรืออุปกรณ์
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-slate-700">เลือกห้อง</Label>
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกห้อง" /></SelectTrigger>
              <SelectContent>{mockRooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">ประเภทปัญหา (ถ้ามี)</Label>
            <Select value={problemType} onValueChange={setProblemType}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment">อุปกรณ์ชำรุด</SelectItem>
                <SelectItem value="cleanliness">ความสะอาด</SelectItem>
                <SelectItem value="suggestion">ข้อเสนอแนะ</SelectItem>
                <SelectItem value="other">อื่น ๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">รายละเอียดปัญหา หรือคำติชม</Label>
            <Textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="อธิบายปัญหา หรือข้อเสนอแนะต่างๆ..." className="rounded-xl min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">ระดับความเร่งด่วน</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกระดับ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">ต่ำ</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">อัปโหลดรูปภาพ</Label>
            <label className="block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group">
              {image ? (
                <div className="relative">
                  <img src={image} alt="Preview" className="max-h-40 mx-auto object-contain rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <p className="text-white text-sm font-medium">คลิกเพื่อเปลี่ยนรูป</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-sm text-slate-500">คลิกเพื่อเลือกไฟล์รูปภาพ (ไม่เกิน 2MB)</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && (
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setImage('')} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 text-xs">
                  ลบรูปภาพ
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full rounded-2xl glow-primary hover-lift mt-4" size="lg">
            ส่งรายงานปัญหา
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
