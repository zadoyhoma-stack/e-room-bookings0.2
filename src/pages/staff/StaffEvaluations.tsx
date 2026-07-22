import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Evaluation } from "@/data/mockData";
import { cn } from "@/lib/utils";
import * as ds from "@/services/dataService";

const StaffEvaluations = () => {
  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ["staff_evaluations"],
    queryFn: () => ds.getEvaluations(),
  });

  const avgRating = evaluations.length
    ? (evaluations.reduce((acc, curr) => acc + curr.rating, 0) / evaluations.length).toFixed(1)
    : "0.0";

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: evaluations.filter((e) => e.rating === star).length,
    pct: evaluations.length ? Math.round((evaluations.filter((e) => e.rating === star).length / evaluations.length) * 100) : 0,
  }));

  const renderStars = (rating: number, size: number = 16) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            "transition-colors",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-8 font-['Kanit',sans-serif]">
      {/* Header */}
      <div className="flex items-center gap-5">
        <div className="p-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg shadow-rose-500/30">
          <Star className="h-8 w-8 md:h-10 md:w-10 text-white fill-white/20" />
        </div>
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 drop-shadow-sm">ผลประเมินความพึงพอใจ</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">ผลประเมินจากนักศึกษาที่ใช้ระบบจองห้อง</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
        {/* Average Score Card */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg shadow-rose-100/50 hover:shadow-xl transition-all duration-300 group">
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 mb-2 drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{avgRating}</div>
          <div className="mb-4">{renderStars(Math.round(Number(avgRating)), 28)}</div>
          <p className="text-sm text-rose-700 font-bold uppercase tracking-wide">คะแนนเฉลี่ยรวม</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-600/70 bg-white/50 px-3 py-1 rounded-full">
            <Users className="h-3.5 w-3.5" />
            จากผู้ประเมิน {evaluations.length} คน
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-3xl p-8 md:col-span-2">
          <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            การกระจายคะแนน
          </h3>
          <div className="space-y-3">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="text-sm font-bold text-gray-700">{star}</span>
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      star >= 4 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                      star === 3 ? "bg-gradient-to-r from-sky-400 to-sky-500" :
                      "bg-gradient-to-r from-rose-400 to-rose-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 w-14 text-right">{count} ({pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation Cards */}
      <div>
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
            <MessageSquare className="h-6 w-6" />
          </div>
          ข้อเสนอแนะจากนักศึกษา
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="h-8 w-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mr-3" />
            กำลังโหลด...
          </div>
        ) : evaluations.length === 0 ? (
          <div className="py-16 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Star className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">ยังไม่มีผลประเมิน</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {evaluations.map((evalItem) => (
              <div
                key={evalItem.id}
                className="bg-white/90 backdrop-blur-md p-6 rounded-[24px] border border-white shadow-lg shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col gap-4 group"
              >
                <div className="flex justify-between items-center">
                  {renderStars(evalItem.rating)}
                  <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                    {new Date(evalItem.submittedAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex-1 bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100/60 shadow-inner group-hover:bg-pink-50/10 transition-colors">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    "{evalItem.feedback || "ไม่มีข้อเสนอแนะเพิ่มเติม"}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffEvaluations;
