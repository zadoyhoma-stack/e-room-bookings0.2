import React from "react";
import { Loader2, FileSpreadsheet, FileIcon } from "lucide-react";

interface ExportProgressProps {
  isExporting: string | null; // 'Excel' | 'PDF' | null
}

export const ExportProgress: React.FC<ExportProgressProps> = ({ isExporting }) => {
  if (!isExporting) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div
          className={`p-4 rounded-2xl ${
            isExporting === "Excel"
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600"
              : "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
          }`}
        >
          {isExporting === "Excel" ? (
            <FileSpreadsheet className="w-10 h-10 animate-bounce" />
          ) : (
            <FileIcon className="w-10 h-10 animate-bounce" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            กำลังสร้างไฟล์รายงาน ({isExporting})...
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            ระบบกำลังประมวลผลจัดทำข้อมูลและดาวน์โหลดไฟล์ลงเครื่องของคุณ กรุณารอสักครู่
          </p>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full w-full animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
