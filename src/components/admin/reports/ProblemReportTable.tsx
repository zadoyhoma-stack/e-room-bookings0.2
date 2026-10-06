import React, { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileIcon,
  AlertTriangle,
} from "lucide-react";

interface ProblemReportTableProps {
  problems: any[];
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isExporting?: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "text-amber-600 bg-amber-50 border-amber-200" },
  in_progress: { label: "กำลังดำเนินการ", color: "text-blue-600 bg-blue-50 border-blue-200" },
  resolved: { label: "แก้ไขแล้ว", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  rejected: { label: "ปฏิเสธ", color: "text-red-600 bg-red-50 border-red-200" },
};

export const ProblemReportTable: React.FC<ProblemReportTableProps> = ({
  problems,
  onExportExcel,
  onExportPdf,
  isExporting,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const totalPages = Math.max(1, Math.ceil(problems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = problems.slice(startIndex, startIndex + itemsPerPage);

  const resolvedCount = problems.filter((p) => p.status === "resolved").length;
  const pendingCount = problems.filter((p) => p.status === "pending").length;

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden mb-6">
      {/* Table Header Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                ตารางรายงานการแจ้งปัญหา
              </h3>
              <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full font-extrabold text-xs">
                ทั้งหมด {problems.length} รายการ
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full font-extrabold text-xs">
                รอดำเนินการ {pendingCount}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full font-extrabold text-xs">
                แก้ไขแล้ว {resolvedCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              รายงานสรุปการแจ้งปัญหาและสถานะการดำเนินงานของระบบ ARIT E-ROOMs
            </p>
          </div>
        </div>

        {/* Quick Export + rows selector */}
        <div className="flex flex-wrap items-center gap-3">
          {onExportExcel && (
            <Button
              size="sm"
              onClick={onExportExcel}
              disabled={problems.length === 0 || !!isExporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> ส่งออก Excel
            </Button>
          )}
          {onExportPdf && (
            <Button
              size="sm"
              onClick={onExportPdf}
              disabled={problems.length === 0 || !!isExporting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20"
            >
              <FileIcon className="w-4 h-4 mr-1.5" /> ส่งออก PDF
            </Button>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-2 border-l border-slate-200 dark:border-slate-700">
            <span>แสดง:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
            >
              <option value={20}>20 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">ลำดับ</th>
              <th className="px-6 py-4">วันที่แจ้ง</th>
              <th className="px-6 py-4">ห้องประชุม</th>
              <th className="px-6 py-4">หัวข้อปัญหา</th>
              <th className="px-6 py-4">ผู้แจ้ง</th>
              <th className="px-6 py-4">รายละเอียด</th>
              <th className="px-6 py-4 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                  ยังไม่มีข้อมูลการแจ้งปัญหา
                </td>
              </tr>
            ) : (
              currentData.map((p, idx) => {
                const sc = statusConfig[p.status] || { label: p.status || "-", color: "text-slate-600 bg-slate-50 border-slate-200" };
                let dateDisplay = "-";
                if (p.createdAt || p.date) {
                  try {
                    dateDisplay = format(new Date(p.createdAt || p.date), "dd MMM yyyy", { locale: th });
                  } catch {
                    dateDisplay = p.createdAt || p.date || "-";
                  }
                }
                return (
                  <tr key={p.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-bold">{startIndex + idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{dateDisplay}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{p.roomName || "-"}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-[180px] truncate" title={p.title || p.subject}>
                      {p.title || p.subject || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{p.userName || p.reporterName || "-"}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate" title={p.description || p.detail}>
                      {p.description || p.detail || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-slate-500 font-medium">
          แสดง {problems.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, problems.length)} จากทั้งหมด {problems.length} รายการ
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl border-slate-200 dark:border-slate-700 h-8 px-3 text-xs">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> ก่อนหน้า
            </Button>
            <span className="font-bold text-slate-600 dark:text-slate-300 px-2">หน้า {currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-xl border-slate-200 dark:border-slate-700 h-8 px-3 text-xs">
              ถัดไป <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
