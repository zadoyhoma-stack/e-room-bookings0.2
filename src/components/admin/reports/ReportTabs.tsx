import React from "react";
import { BarChart3, FileSpreadsheet, History } from "lucide-react";

export type ReportTabType = "overview" | "data" | "history";

interface ReportTabsProps {
  activeTab: ReportTabType;
  setActiveTab: (tab: ReportTabType) => void;
  bookingCount?: number;
  historyCount?: number;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  historyCount,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
      <button
        onClick={() => setActiveTab("overview")}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
          activeTab === "overview"
            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50"
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>ภาพรวมสถิติ</span>
      </button>

      <button
        onClick={() => setActiveTab("data")}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
          activeTab === "data"
            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50"
        }`}
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>ตารางรายงานและดาวน์โหลด</span>
        {bookingCount !== undefined && (
          <span
            className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
              activeTab === "data"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {bookingCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab("history")}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
          activeTab === "history"
            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50"
        }`}
      >
        <History className="w-4 h-4" />
        <span>ประวัติการดาวน์โหลด</span>
        {historyCount !== undefined && (
          <span
            className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
              activeTab === "history"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {historyCount}
          </span>
        )}
      </button>
    </div>
  );
};
