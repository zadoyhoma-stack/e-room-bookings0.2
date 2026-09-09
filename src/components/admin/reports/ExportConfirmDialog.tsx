import React from "react";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { FileIcon, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { ReportFilterState, getStatusThaiText } from "@/lib/report/reportUtils";

interface ExportConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatType: "Excel" | "PDF" | null;
  filters: ReportFilterState;
  recordCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ExportConfirmDialog: React.FC<ExportConfirmDialogProps> = ({
  open,
  onOpenChange,
  formatType,
  filters,
  recordCount,
  onConfirm,
  isLoading = false,
}) => {
  if (!formatType) return null;

  const getDateRangeLabel = () => {
    switch (filters.dateRange) {
      case "today":
        return "วันนี้";
      case "7days":
        return "7 วันที่ผ่านมา";
      case "thisMonth":
        return "เดือนนี้";
      case "lastMonth":
        return "เดือนที่ผ่านมา";
      case "thisYear":
        return "ปีนี้";
      case "custom":
        return `${filters.startDate || "ไม่ระบุ"} ถึง ${filters.endDate || "ไม่ระบุ"}`;
      default:
        return "ข้อมูลทั้งหมด";
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      variant={formatType === "Excel" ? "success" : "danger"}
      icon={formatType === "Excel" ? <FileSpreadsheet className="w-6 h-6" /> : <FileIcon className="w-6 h-6" />}
      title={`ยืนยันการส่งออกรายงาน (${formatType})`}
      description="ตรวจสอบเงื่อนไขข้อมูลและพารามิเตอร์รายงานก่อนทำการดาวน์โหลด"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-slate-200 dark:border-slate-700 font-bold"
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={recordCount === 0 || isLoading}
            className={`rounded-xl font-bold text-white shadow-lg ${
              formatType === "Excel"
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {isLoading ? "กำลังสร้างไฟล์..." : "ยืนยันการส่งออก"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Summary Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2.5 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 font-medium">รูปแบบไฟล์:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {formatType === "Excel" ? "Microsoft Excel (.xlsx)" : "PDF Document (.pdf)"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">ช่วงเวลาข้อมูล:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {getDateRangeLabel()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">ห้องประชุม:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filters.room === "all" ? "ทุกห้องประชุม" : filters.room}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">สถานะรายการ:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filters.status === "all" ? "ทุกสถานะ" : getStatusThaiText(filters.status)}
            </span>
          </div>

          {filters.search && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">คำค้นหา:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">
                "{filters.search}"
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center">
            <span className="font-bold text-slate-900 dark:text-white">จำนวนรายการที่จะส่งออก:</span>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full font-black text-xs">
              {recordCount} รายการ
            </span>
          </div>
        </div>

        {recordCount === 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            ไม่พบข้อมูลตามเงื่อนไขที่เลือก กรุณาเปลี่ยนตัวกรองก่อนทำการส่งออก
          </div>
        )}
      </div>
    </AppModal>
  );
};
