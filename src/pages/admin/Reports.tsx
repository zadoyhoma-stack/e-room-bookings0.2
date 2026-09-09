import { useState, useMemo } from "react";
import { BarChart3, Download, FileIcon, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ds from "@/services/dataService";

import { ReportTabs, ReportTabType } from "@/components/admin/reports/ReportTabs";
import { ReportSummary } from "@/components/admin/reports/ReportSummary";
import { ReportFilters } from "@/components/admin/reports/ReportFilters";
import { BookingReportTable } from "@/components/admin/reports/BookingReportTable";
import { RoomUsageChart } from "@/components/admin/reports/RoomUsageChart";
import { ExportHistoryTable } from "@/components/admin/reports/ExportHistoryTable";
import { ExportConfirmDialog } from "@/components/admin/reports/ExportConfirmDialog";
import { ExportProgress } from "@/components/admin/reports/ExportProgress";

import {
  ReportFilterState,
  filterReportBookings,
  calculateReportStats,
  validateDateRange,
} from "@/lib/report/reportUtils";
import { exportToExcel } from "@/lib/report/excelExport";
import { exportToPdf } from "@/lib/report/pdfExport";

const Reports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ReportTabType>("overview");

  // Export Confirmation Dialog State
  const [confirmExportType, setConfirmExportType] = useState<"Excel" | "PDF" | null>(null);

  // Export Progress Indicator State
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

  // Authorization Check
  const currentUserRaw = localStorage.getItem("arit_user") || sessionStorage.getItem("arit_user");
  const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
  const isAdminOrStaff =
    !currentUser || (currentUser && (currentUser.role === "admin" || currentUser.role === "staff"));

  // Filter State
  const [filters, setFilters] = useState<ReportFilterState>({
    dateRange: "all",
    startDate: "",
    endDate: "",
    room: "all",
    status: "all",
    userName: "all",
    search: "",
  });

  // Queries from DB
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["admin_bookings"],
    queryFn: () => ds.getBookings(),
  });

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ["admin_rooms"],
    queryFn: () => ds.getRooms(),
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["admin_users"],
    queryFn: () => ds.getUsers(),
  });

  const { data: reports = [] } = useQuery<any[]>({
    queryKey: ["reports"],
    queryFn: () => ds.getReports(),
  });

  // Filtered dataset
  const filteredBookings = useMemo(() => {
    return filterReportBookings(bookings, filters);
  }, [bookings, filters]);

  // Statistics calculated strictly from filtered dataset
  const statsData = useMemo(() => {
    return calculateReportStats(filteredBookings, rooms);
  }, [filteredBookings, rooms]);

  // Monthly trends for RoomUsageChart
  const monthlyData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    filteredBookings.forEach((b) => {
      if (b.date) {
        const [yyyy, mm] = b.date.split("-");
        if (yyyy && mm) {
          const key = `${yyyy}-${mm}`;
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
      }
    });

    const monthNames = [
      "",
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    const data = Object.keys(monthCounts)
      .sort()
      .slice(-6)
      .map((key) => {
        const [, mm] = key.split("-");
        return {
          name: monthNames[parseInt(mm)] || key,
          "จำนวนการจอง": monthCounts[key],
        };
      });

    return data.length > 0 ? data : [{ name: "ไม่มีข้อมูล", "จำนวนการจอง": 0 }];
  }, [filteredBookings]);

  // Pie chart room usage data
  const roomUsagePieData = useMemo(() => {
    const pie = statsData.roomStats
      .slice(0, 6)
      .map((r) => ({ name: r.roomName, value: r.total }))
      .filter((r) => r.value > 0);
    return pie.length > 0 ? pie : [{ name: "ไม่มีข้อมูล", value: 0 }];
  }, [statsData.roomStats]);

  // Mutation for saving report logs
  const createReportMutation = useMutation({
    mutationFn: ds.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  // Trigger Confirm Dialog
  const handleOpenExportConfirm = (formatType: "Excel" | "PDF") => {
    if (filters.dateRange === "custom") {
      const validation = validateDateRange(filters.startDate, filters.endDate);
      if (!validation.isValid) {
        toast({
          title: "ข้อมูลตัวกรองไม่ถูกต้อง",
          description: validation.errorMessage || "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด",
          variant: "destructive",
        });
        return;
      }
    }

    if (filteredBookings.length === 0) {
      toast({
        title: "ไม่พบข้อมูลการจอง",
        description: "ไม่พบข้อมูลตามเงื่อนไขที่เลือก ไม่สามารถสร้างรายงานเปล่าได้",
        variant: "destructive",
      });
      return;
    }

    setConfirmExportType(formatType);
  };

  // Perform Actual Export after Confirmation
  const handleExecuteExport = async () => {
    if (!confirmExportType) return;
    const formatType = confirmExportType;
    setConfirmExportType(null); // Close dialog
    setIsExporting(formatType);

    try {
      let fileName: string;

      if (formatType === "Excel") {
        fileName = exportToExcel(
          filteredBookings,
          filters,
          statsData.summary,
          statsData.roomStats
        );
      } else {
        fileName = await exportToPdf(
          filteredBookings,
          filters,
          statsData.summary,
          statsData.roomStats
        );
      }

      // Record export history audit log to DB
      createReportMutation.mutate({
        type: "รายงานสรุปการจองห้องประชุม",
        room: filters.room === "all" ? "ทุกห้อง" : filters.room,
        format: formatType,
        dateFrom: filters.startDate || undefined,
        dateTo: filters.endDate || undefined,
        filters: filters,
        fileName: fileName,
        recordCount: filteredBookings.length,
      });

      toast({
        title: `✓ ส่งออกรายงาน ${formatType} สำเร็จ!`,
        description: `ไฟล์ ${fileName} ถูกดาวน์โหลดเรียบร้อยแล้ว (${filteredBookings.length} รายการ)`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "ไม่สามารถสร้างรายงานได้",
        description: err?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  // Re-download from Export History
  const handleReDownload = async (report: any) => {
    setIsDownloadingId(report.id);

    try {
      let savedFilters: ReportFilterState = filters;
      if (report.filters) {
        savedFilters = typeof report.filters === "string" ? JSON.parse(report.filters) : report.filters;
      }

      const reFiltered = filterReportBookings(bookings, savedFilters);

      if (reFiltered.length === 0) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ข้อมูลตามเงื่อนไขเดิมอาจถูกเปลี่ยนแปลงหรือลบจากระบบแล้ว",
          variant: "destructive",
        });
        return;
      }

      const reStats = calculateReportStats(reFiltered, rooms);

      if ((report.format || "").toUpperCase() === "EXCEL") {
        exportToExcel(reFiltered, savedFilters, reStats.summary, reStats.roomStats);
      } else {
        await exportToPdf(reFiltered, savedFilters, reStats.summary, reStats.roomStats);
      }

      toast({
        title: "✓ ดาวน์โหลดสำเร็จ!",
        description: `ดาวน์โหลดรายงาน ${report.format} ใหม่เรียบร้อยแล้ว`,
      });
    } catch (err: any) {
      console.error("Re-download error:", err);
      toast({
        title: "เกิดข้อผิดพลาดในการดาวน์โหลด",
        description: err?.message || "ไม่สามารถสร้างรายงานซ้ำได้",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingId(null);
    }
  };

  // Access restriction fallback
  if (!isAdminOrStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="p-4 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-full mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ไม่มีสิทธิ์เข้าถึงหน้าดังกล่าว</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          หน้าออกรายงานนี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) หรือเจ้าหน้าที่ (Staff) เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 dark:bg-slate-900/70 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none backdrop-blur-xl border border-white/60 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            รายงานและสถิติ (Reports & Analytics)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
            ดูข้อมูลการจอง วิเคราะห์การใช้งาน และจัดทำรายงานสำหรับการบริหารจัดการห้องประชุม ARIT E-ROOMs
          </p>
        </div>

        {/* Header Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenExportConfirm("Excel")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs h-10 px-4 shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> ส่งออก Excel
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenExportConfirm("PDF")}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs h-10 px-4 shadow-md shadow-rose-600/20"
          >
            <FileIcon className="w-4 h-4 mr-1.5" /> ส่งออก PDF
          </Button>
        </div>
      </div>

      {/* 2. Navigation Tabs Bar */}
      <ReportTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={filteredBookings.length}
        historyCount={reports.length}
      />

      {/* 3. TAB 1: Overview & Analytics */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* KPI Summary 5 Cards */}
          <ReportSummary stats={statsData.summary} />

          {/* Visual Charts */}
          <RoomUsageChart monthlyData={monthlyData} roomUsageData={roomUsagePieData} />
        </div>
      )}

      {/* 4. TAB 2: Data Report & Export */}
      {activeTab === "data" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Filter Bar with Quick Date Presets */}
          <ReportFilters
            filters={filters}
            setFilters={setFilters}
            rooms={rooms}
            users={users}
          />

          {/* KPI Summary Mini Bar */}
          <ReportSummary stats={statsData.summary} />

          {/* Booking Data Table with Quick Export Bar & Pagination */}
          <BookingReportTable
            bookings={filteredBookings}
            onExportExcel={() => handleOpenExportConfirm("Excel")}
            onExportPdf={() => handleOpenExportConfirm("PDF")}
            isExporting={isExporting}
          />
        </div>
      )}

      {/* 5. TAB 3: Export History */}
      {activeTab === "history" && (
        <div className="animate-in fade-in duration-300">
          <ExportHistoryTable
            reports={reports}
            onDownload={handleReDownload}
            isDownloadingId={isDownloadingId}
          />
        </div>
      )}

      {/* Export Confirmation Dialog */}
      <ExportConfirmDialog
        open={!!confirmExportType}
        onOpenChange={(open) => !open && setConfirmExportType(null)}
        formatType={confirmExportType}
        filters={filters}
        recordCount={filteredBookings.length}
        onConfirm={handleExecuteExport}
        isLoading={!!isExporting}
      />

      {/* Export Progress Overlay */}
      <ExportProgress isExporting={isExporting} />
    </div>
  );
};

export default Reports;
