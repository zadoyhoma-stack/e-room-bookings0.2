import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Download, FileSpreadsheet, FileIcon, Search, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface ExportHistoryTableProps {
  reports: any[];
  onDownload: (report: any) => void;
  isDownloadingId: string | null;
}

export const ExportHistoryTable: React.FC<ExportHistoryTableProps> = ({
  reports,
  onDownload,
  isDownloadingId,
}) => {
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Format Filter
      if (formatFilter !== "all" && (r.format || "").toUpperCase() !== formatFilter.toUpperCase()) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const typeStr = (r.type || "").toLowerCase();
        const fileStr = (r.fileName || "").toLowerCase();
        const userStr = (r.userName || r.user || "admin").toLowerCase();
        const roomStr = (r.room || "").toLowerCase();

        return typeStr.includes(q) || fileStr.includes(q) || userStr.includes(q) || roomStr.includes(q);
      }
      return true;
    });
  }, [reports, search, formatFilter]);

  const getDateRangeDisplay = (r: any) => {
    if (r.dateFrom && r.dateTo) {
      return `${r.dateFrom} ถึง ${r.dateTo}`;
    }
    if (r.filters) {
      try {
        const parsed = typeof r.filters === "string" ? JSON.parse(r.filters) : r.filters;
        if (parsed.dateRange === "today") return "วันนี้";
        if (parsed.dateRange === "7days") return "7 วันที่ผ่านมา";
        if (parsed.dateRange === "thisMonth") return "เดือนนี้";
        if (parsed.dateRange === "lastMonth") return "เดือนที่ผ่านมา";
        if (parsed.dateRange === "thisYear") return "ปีนี้";
        if (parsed.dateRange === "custom") return `${parsed.startDate || ""} - ${parsed.endDate || ""}`;
      } catch {}
    }
    return "ทั้งหมด";
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ประวัติการส่งออกรายงาน (Export Audit Logs)
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            ตรวจสอบประวัติการออกรายงานและกดดาวน์โหลดไฟล์ซ้ำได้ทันที
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อไฟล์, ผู้สร้าง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-32 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs font-bold">
              <SelectValue placeholder="รูปแบบไฟล์" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">ทุกประเภท</SelectItem>
              <SelectItem value="EXCEL">Excel (.xlsx)</SelectItem>
              <SelectItem value="PDF">PDF (.pdf)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="py-4 px-6">วันที่และเวลา</th>
              <th className="py-4 px-6">ผู้สร้างรายงาน</th>
              <th className="py-4 px-6">ประเภทรายงาน</th>
              <th className="py-4 px-6 text-center">รูปแบบ</th>
              <th className="py-4 px-6">ช่วงข้อมูล</th>
              <th className="py-4 px-6 text-right">การจัดการ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                  <History className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 opacity-60" />
                  ไม่พบประวัติการส่งออกรายงาน
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const isDownloading = isDownloadingId === report.id;
                const formatUpper = (report.format || "EXCEL").toUpperCase();

                let dateFormatted = "-";
                if (report.createdAt) {
                  try {
                    dateFormatted = format(new Date(report.createdAt), "dd/MM/yyyy HH:mm น.", { locale: th });
                  } catch {
                    dateFormatted = String(report.createdAt);
                  }
                }

                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {dateFormatted}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {report.userName || report.user || "Administrator"}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {report.type || "รายงานสรุปการจอง"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                        {report.fileName || "-"}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          formatUpper === "EXCEL"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        {formatUpper === "EXCEL" ? (
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        ) : (
                          <FileIcon className="w-3.5 h-3.5" />
                        )}
                        {formatUpper}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                      {getDateRangeDisplay(report)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload(report)}
                        disabled={isDownloading}
                        className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/50 font-bold text-xs"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        ดาวน์โหลดซ้ำ
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
