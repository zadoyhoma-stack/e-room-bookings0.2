import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Problem, ProblemStatus, ProblemUrgency } from "@/data/mockData";
import * as ds from "@/services/dataService";

type Tab = "pending" | "resolved" | "all";

const StaffProblems = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const { data: problems = [], isLoading } = useQuery<Problem[]>({
    queryKey: ["staff_problems"],
    queryFn: () => ds.getProblems(),
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProblemStatus }) => {
      return ds.updateProblemStatus(id, status);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff_problems"] }); toast.success("อัปเดตสถานะสำเร็จ"); },
    onError: () => toast.error("เกิดข้อผิดพลาด"),
  });

  const filtered = tab === "all" ? problems : problems.filter(p => p.status === tab);
  const pendingCount = problems.filter(p => p.status === "pending").length;

  const urgencyBadge = (u: ProblemUrgency) => {
    const cfg = { high: { cls: "bg-rose-50 text-rose-700 border-rose-200", t: "เร่งด่วน" }, medium: { cls: "bg-amber-50 text-amber-700 border-amber-200", t: "ปานกลาง" }, low: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", t: "ต่ำ" } };
    const c = cfg[u];
    return <span className={cn("text-xs font-bold px-3 py-1 rounded-full border", c.cls)}>{c.t}</span>;
  };

  return (
    <div className="space-y-8 font-['Kanit',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 flex items-center gap-4 drop-shadow-sm">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/30">
              <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            รายงานปัญหาจากนักศึกษา
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-rose-600 font-bold mt-3 ml-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span> 
              มี {pendingCount} รายการรอรับเรื่อง
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200 shadow-lg shadow-slate-200/50 w-fit">
        {([
          { key: "pending" as Tab, label: "รอรับเรื่อง" },
          { key: "resolved" as Tab, label: "ดำเนินการแล้ว" },
          { key: "all" as Tab, label: "ทั้งหมด" },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn(
            "px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
            tab === t.key ? "bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-md shadow-orange-500/20" : "text-slate-500 hover:text-orange-700 hover:bg-orange-50/50"
          )}>
            {t.label}
            {t.key === "pending" && pendingCount > 0 && (
              <span className={cn("ml-2 px-2.5 py-0.5 text-[11px] font-black rounded-full", tab === "pending" ? "bg-white/30 text-white" : "bg-rose-500 text-white shadow-sm shadow-rose-500/40")}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400"><div className="h-6 w-6 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />โหลดข้อมูล...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium">ไม่มีรายการ</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className={cn(
              "bg-white/90 backdrop-blur-xl rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col overflow-hidden relative group",
              p.status === "pending" ? "border-orange-200 shadow-orange-100/50 hover:shadow-orange-200/50" : "border-white shadow-slate-200/50"
            )}>
              {p.status === "pending" && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>}
              
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-3">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl shadow-inner", p.status === "pending" ? "bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 border border-orange-50" : "bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 border border-emerald-50")}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{p.problemType}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{new Date(p.reportedAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                {urgencyBadge(p.urgency)}
              </div>

              {/* Body */}
              <div className="px-6 pb-4 flex-1">
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/60 text-sm text-slate-700 leading-relaxed shadow-sm">
                  <p className="font-black text-slate-400 text-xs mb-2 uppercase tracking-wide">รายละเอียด</p>
                  <p className="font-medium">{p.details}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200/60">
                    <p className="font-black text-slate-400 text-xs mb-1 uppercase tracking-wide">ห้อง</p>
                    <p className="font-bold text-slate-800">{p.roomId}</p>
                  </div>
                </div>

                {/* Image */}
                {p.image && (
                  <button
                    onClick={() => setExpandedImage(p.image!)}
                    className="mt-2 w-full overflow-hidden rounded-lg border border-slate-200 hover:opacity-90 transition-opacity group relative"
                  >
                    <img src={p.image} alt="ภาพประกอบ" className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </button>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-slate-100/60 flex items-center justify-between">
                <span className={cn("text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm border",
                  p.status === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-orange-50 text-orange-700 border-orange-100"
                )}>
                  {p.status === "resolved" ? "✅ ดำเนินการแล้ว" : "⏳ รอรับเรื่อง"}
                </span>
                {p.status === "pending" && (
                  <button
                    onClick={() => mutation.mutate({ id: p.id, status: "resolved" })}
                    disabled={mutation.isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={18} /> รับทราบ/แก้ไขแล้ว
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {expandedImage && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="ภาพขยาย" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default StaffProblems;
