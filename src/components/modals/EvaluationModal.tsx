import { useState } from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as ds from "@/services/dataService";

interface EvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RATING_LABELS = ["", "แย่มาก", "พอใช้", "ปานกลาง", "ดี", "ดีมาก"];

export const EvaluationModal = ({ open, onOpenChange }: EvaluationModalProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "กรุณาให้คะแนนความพึงพอใจก่อนส่ง", variant: "destructive" });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await ds.createEvaluation({ rating, feedback });
      sessionStorage.setItem("arit_evaluated", "true");
      toast({
        title: "ขอบคุณสำหรับการประเมิน",
        description: "ข้อมูลของคุณจะถูกนำไปพัฒนาการบริการต่อไป",
      });
      setRating(0);
      setHovered(0);
      setFeedback("");
      onOpenChange(false);
    } catch (err) {
      console.error("Evaluation error:", err);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถส่งผลประเมินได้", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hovered || rating;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      variant="success"
      icon={<img src="/university-logo.png" alt="ตรามหาวิทยาลัย" className="w-6 h-6 object-contain" />}
      title="ประเมินความพึงพอใจระบบ ARIT E-ROOMs"
      description="ข้อมูลการประเมินของคุณช่วยพัฒนาการให้บริการห้องประชุมออนไลน์"
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Box */}
        <div className="flex flex-col items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60">
          <p className="text-slate-700 dark:text-slate-200 text-xs font-bold">
            เลือกระดับความพึงพอใจการใช้งาน
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-1 transition-all duration-200 hover:scale-125 active:scale-95"
              >
                <Star
                  className={`h-9 w-9 transition-all ${
                    activeRating >= star
                      ? "text-amber-400 fill-amber-400 drop-shadow-md"
                      : "text-slate-200 dark:text-slate-700 fill-transparent"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          <div className="h-7 flex items-center">
            {activeRating > 0 ? (
              <span className="text-amber-700 dark:text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                ⭐ {activeRating}/5 — {RATING_LABELS[activeRating]}
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-medium">คลิกที่ดาวเพื่อเลือกคะแนน</span>
            )}
          </div>
        </div>

        {/* Feedback Textarea */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            ข้อเสนอแนะเพิ่มเติม (ถ้ามี)
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="บอกความรู้สึก ข้อเสนอแนะ หรือสิ่งที่อยากให้ปรับปรุง..."
            className="rounded-xl min-h-[90px] resize-none bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-medium"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-11 shadow-lg shadow-emerald-600/20 mt-2"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "กำลังส่งแบบประเมิน..." : "ส่งแบบประเมิน"}
        </Button>
      </form>
    </AppModal>
  );
};
