import { useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockRooms } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Upload, Trash2 } from "lucide-react";
import * as ds from "@/services/dataService";

interface ReportProblemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ReportProblemModal = ({ open, onOpenChange, onSuccess }: ReportProblemModalProps) => {
  const { toast } = useToast();
  const [room, setRoom] = useState("");
  const [problemType, setProblemType] = useState("");
  const [details, setDetails] = useState("");
  const [urgency, setUrgency] = useState("");
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "รูปภาพต้องมีขนาดไม่เกิน 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !problemType || !details) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await ds.createProblem({
        roomId: room,
        details: details,
        problemType: problemType,
        urgency: urgency as any,
        rating: rating,
        image: image,
      });

      setRoom("");
      setProblemType("");
      setDetails("");
      setUrgency("");
      setRating(0);
      setImage("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Report problem error:", err);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถส่งรายงานได้", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      variant="warning"
      icon={<AlertTriangle className="w-6 h-6" />}
      title="รายงานปัญหาการใช้งานห้องประชุม"
      description="แจ้งปัญหาอุปกรณ์ อุปกรณ์ชำรุด หรือข้อเสนอแนะต่างๆ"
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              เลือกห้องประชุม <span className="text-rose-500">*</span>
            </Label>
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs">
                <SelectValue placeholder="-- เลือกห้อง --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {mockRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              ประเภทปัญหา <span className="text-rose-500">*</span>
            </Label>
            <Select value={problemType} onValueChange={setProblemType}>
              <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs">
                <SelectValue placeholder="-- เลือกประเภท --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="equipment">อุปกรณ์ชำรุด</SelectItem>
                <SelectItem value="cleanliness">ความสะอาด</SelectItem>
                <SelectItem value="suggestion">ข้อเสนอแนะ</SelectItem>
                <SelectItem value="other">อื่น ๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            รายละเอียดปัญหา หรือคำติชม <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="อธิบายรายละเอียดของปัญหา หรือข้อเสนอแนะต่างๆ..."
            className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 min-h-[80px] resize-none text-xs font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              ระดับความเร่งด่วน
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs">
                <SelectValue placeholder="-- เลือกระดับ --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="low">ต่ำ</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="high">สูง (ต้องการแก้ไขด่วน)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              แนบรูปภาพปัญหา (ถ้ามี)
            </Label>
            <label className="block border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-11 flex items-center justify-center">
              {image ? (
                <span className="text-xs text-indigo-600 font-bold truncate px-2">
                  ✓ แนบรูปแล้ว (คลิกเปลี่ยน)
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs">
                  <Upload className="h-4 w-4 text-indigo-500" />
                  <span>แนบไฟล์รูป (ไม่เกิน 2MB)</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && (
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="text-rose-500 hover:text-rose-600 text-[11px] font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> ลบรูปแนบ
                </button>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold h-11 shadow-lg shadow-amber-600/20 mt-2"
        >
          {isSubmitting ? "กำลังส่งรายงาน..." : "ส่งรายงานปัญหา"}
        </Button>
      </form>
    </AppModal>
  );
};
