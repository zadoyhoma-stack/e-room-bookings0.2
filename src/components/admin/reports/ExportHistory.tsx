import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, Search, Calendar, FileIcon, FileSpreadsheet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface ExportHistoryProps {
  reports: any[];
  onDownload: (report: any) => void;
  isDownloadingId: string | null;
}

export const ExportHistory = ({ reports, onDownload, isDownloadingId }: ExportHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = reports.filter((r) => {
    const q = searchTerm.toLowerCase();
    const typeStr = (r.type || "").toLowerCase();
    const roomStr = (r.room || "").toLowerCase();
    const formatStr = (r.format || "").toLowerCase();
    const fileStr = (r.fileName || "").toLowerCase();
    return (
      typeStr.includes(q) ||
      roomStr.includes(q) ||
      formatStr.includes(q) ||
      fileStr.includes(q)
    );
  });

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            ประวัติการส่งออกรายงาน (Export History)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติรายงานที่เคยถูกส่งออกจากระบบ สามารถสร้างดาวน์โหลดใหม่ด้วยเงื่อนไขเดิมย้อนหลังได้
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="ค้นหาประวัติรายงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">วันที่/เวลา</th>
              <th className="px-6 py-4 font-bold tracking-wider">ชื่อไฟล์</th>
              <th className="px-6 py-4 font-bold tracking-wider">รูปแบบ</th>
              <th className="px-6 py-4 font-bold tracking-wider">ช่วงวันที่ข้อมูล</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                  ยังไม่มีประวัติการส่งออกรายงานในระบบ
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                let dateDisplay = "-";
                if (report.createdAt) {
                  try {
                    dateDisplay = format(new Date(report.createdAt), "dd MMM yyyy HH:mm น.", { locale: th });
                  } catch {
                    dateDisplay = String(report.createdAt);
                  }
                }

                const isPdf = (report.format || "").toUpperCase() === "PDF";

                return (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {dateDisplay}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {report.fileName || `${report.type || 'รายงานการจอง'} (${report.room || 'ทุกห้อง'})`}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {isPdf ? (
                        <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg text-xs">
                          <FileIcon className="w-4 h-4" /> PDF
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg text-xs">
                          <FileSpreadsheet className="w-4 h-4" /> Excel
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium text-xs">
                      {report.dateFrom && report.dateTo
                        ? `${report.dateFrom} ถึง ${report.dateTo}`
                        : "ทั้งหมด"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors font-bold"
                        onClick={() => onDownload(report)}
                        disabled={isDownloadingId === report.id}
                      >
                        {isDownloadingId === report.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        ดาวน์โหลดไฟล์เดิม
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
