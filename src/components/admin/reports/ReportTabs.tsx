import React from "react";
import { FileSpreadsheet, History, CalendarCheck, Star, AlertTriangle, FileText } from "lucide-react";

export type ReportTabType = "booking" | "evaluation" | "problem" | "data" | "history";

interface ReportTabsProps {
  activeTab: ReportTabType;
  setActiveTab: (tab: ReportTabType) => void;
  bookingCount?: number;
  evaluationCount?: number;
  problemCount?: number;
  historyCount?: number;
}

const tabs: {
  key: ReportTabType;
  label: string;
  icon: React.ReactNode;
  countKey?: keyof ReportTabsProps;
  activeColor: string;
}[] = [
  { key: "booking", label: "รายงานการจอง", icon: <CalendarCheck className="w-4 h-4" />, countKey: "bookingCount", activeColor: "text-blue-600 dark:text-blue-400" },
  { key: "evaluation", label: "รายงานประเมิน", icon: <Star className="w-4 h-4" />, countKey: "evaluationCount", activeColor: "text-amber-600 dark:text-amber-400" },
  { key: "problem", label: "รายงานปัญหา", icon: <AlertTriangle className="w-4 h-4" />, countKey: "problemCount", activeColor: "text-rose-600 dark:text-rose-400" },
  { key: "data", label: "รายงานรวม", icon: <FileText className="w-4 h-4" />, countKey: "bookingCount", activeColor: "text-violet-600 dark:text-violet-400" },
  { key: "history", label: "ประวัติการดาวน์โหลด", icon: <History className="w-4 h-4" />, countKey: "historyCount", activeColor: "text-slate-600 dark:text-slate-400" },
];

export const ReportTabs: React.FC<ReportTabsProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  evaluationCount,
  problemCount,
  historyCount,
}) => {
  const counts: Record<string, number | undefined> = {
    bookingCount,
    evaluationCount,
    problemCount,
    historyCount,
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tab.countKey ? counts[tab.countKey] : undefined;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              isActive
                ? `bg-white dark:bg-slate-900 ${tab.activeColor} shadow-md shadow-slate-200/50 dark:shadow-none`
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
