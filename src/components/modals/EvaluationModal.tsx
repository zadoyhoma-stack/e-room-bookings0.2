import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, MessageSquareHeart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as ds from "@/services/dataService";

interface EvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RATING_LABELS = ['', 'แย่มาก', 'พอใช้', 'ปานกลาง', 'ดี', 'ดีมาก'];

export const EvaluationModal = ({ open, onOpenChange }: EvaluationModalProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: "กรุณาให้คะแนน", variant: "destructive" });
      return;
    }

    try {
      await ds.createEvaluation({ rating, feedback });
      toast({ title: "ขอบคุณสำหรับการประเมิน", description: "ข้อมูลของคุณจะถูกนำไปพัฒนาต่อไป" });
      setRating(0);
      setHovered(0);
      setFeedback("");
      onOpenChange(false);
    } catch (err) {
      console.error("Evaluation error:", err);
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถส่งผลประเมินได้", variant: "destructive" });
    }
  };

  const activeRating = hovered || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md overflow-hidden">
        <DialogTitle className="sr-only">ประเมินความพึงพอใจ</DialogTitle>
        <div className="relative rounded-3xl overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Light blue theme background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0f7ff]/90 via-white/80 to-[#e0f0ff]/70" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 p-8 sm:p-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500 to-blue-600">
                <MessageSquareHeart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">ประเมินความพึงพอใจ</h2>
              <p className="text-sm text-slate-500 mt-1 text-center font-medium">ARIT E-ROOMs · ม.ราชภัฎมหาสารคาม</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="flex flex-col items-center gap-3 bg-white/50 p-6 rounded-2xl border border-blue-50">
                <p className="text-slate-600 text-sm font-semibold">เลือกระดับความพึงพอใจของคุณ</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="p-1.5 transition-all duration-300 hover:scale-125 active:scale-95 group"
                    >
                      <Star
                        className={`h-10 w-10 transition-all duration-300 ${
                          activeRating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-transparent group-hover:text-amber-200'
                        }`}
                        style={activeRating >= star ? {
                          filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.4))'
                        } : {}}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-8 flex items-center mt-1">
                  {activeRating > 0 ? (
                    <span className="text-amber-600 font-bold text-sm px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 shadow-sm animate-in zoom-in-95 duration-200">
                      ⭐ {activeRating}/5 — {RATING_LABELS[activeRating]}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm px-4 py-1.5">คลิกที่ดาวเพื่อให้คะแนน</span>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <label className="text-slate-700 text-sm font-semibold ml-1">ข้อเสนอแนะเพิ่มเติม (ถ้ามี)</label>
                <Textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="บอกเราว่าส่วนไหนดี หรือส่วนไหนควรปรับปรุง..."
                  className="rounded-2xl min-h-[110px] resize-none bg-white/70 border-blue-100 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all shadow-sm p-4"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
              >
                <Send className="mr-2 h-5 w-5" />
                ส่งผลประเมิน
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
