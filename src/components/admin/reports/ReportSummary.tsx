import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, XCircle, Ban, Award, TrendingUp } from "lucide-react";
import { ReportSummaryStats } from "@/lib/report/reportUtils";

interface ReportSummaryProps {
  stats: ReportSummaryStats;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ stats }) => {
  const total = stats.total || 1;
  const approvedPct = Math.round((stats.approved / total) * 100) || 0;
  const pendingPct = Math.round((stats.pending / total) * 100) || 0;
  const rejectedPct = Math.round((stats.rejected / total) * 100) || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Total */}
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">การจองทั้งหมด</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>ภาพรวมข้อมูลทั้งหมด</span>
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Approved */}
      <Card className="border border-emerald-100 dark:border-emerald-900/50 shadow-md shadow-emerald-500/5 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">อนุมัติแล้ว</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</h3>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {approvedPct}% จากทั้งหมด
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Pending */}
      <Card className="border border-amber-100 dark:border-amber-900/50 shadow-md shadow-amber-500/5 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">รออนุมัติ</p>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</h3>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {stats.pending > 0 ? "ต้องดำเนินการ" : "ไม่มีรายการค้าง"}
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Rejected */}
      <Card className="border border-rose-100 dark:border-rose-900/50 shadow-md shadow-rose-500/5 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative group">
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ปฏิเสธ / ยกเลิก</p>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400">
                {stats.rejected + stats.cancelled}
              </h3>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {rejectedPct}% จากทั้งหมด
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Popular Room */}
      <Card className="border-0 shadow-lg shadow-indigo-500/10 dark:shadow-none bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl overflow-hidden relative group col-span-2 md:col-span-1">
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start">
            <div className="overflow-hidden pr-2">
              <p className="text-xs font-bold text-indigo-100 mb-1">ห้องยอดนิยมสูงสุด</p>
              <h3 className="text-base font-black truncate" title={stats.popularRoom.name}>
                {stats.popularRoom.name}
              </h3>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 text-white backdrop-blur-sm">
                {stats.popularRoom.count} ครั้ง
              </div>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
