import * as XLSX from "xlsx";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ReportFilterState, ReportSummaryStats, RoomStatistic, getStatusThaiText } from "./reportUtils";

export function exportToExcel(
  bookings: any[],
  filters: ReportFilterState,
  stats: ReportSummaryStats,
  roomStats: RoomStatistic[]
): string {
  const wb = XLSX.utils.book_new();

  // Format date range text for header
  let dateRangeText = "ทั้งหมด";
  if (filters.dateRange === "custom" && filters.startDate && filters.endDate) {
    dateRangeText = `${filters.startDate} ถึง ${filters.endDate}`;
  } else if (filters.dateRange === "today") {
    dateRangeText = "วันนี้";
  } else if (filters.dateRange === "7days") {
    dateRangeText = "7 วันที่ผ่านมา";
  } else if (filters.dateRange === "thisMonth") {
    dateRangeText = "เดือนนี้";
  } else if (filters.dateRange === "lastMonth") {
    dateRangeText = "เดือนที่ผ่านมา";
  } else if (filters.dateRange === "thisYear") {
    dateRangeText = "ปีนี้";
  }

  // ==================== Sheet 1: Summary ====================
  const summaryData = [
    ["ระบบจองห้องประชุมออนไลน์ ARIT E-ROOMs"],
    ["รายงานสรุปการใช้ห้องประชุม"],
    ["สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏมหาสารคาม"],
    [""],
    ["วันที่พิมพ์รายงาน:", format(new Date(), "dd MMMM yyyy HH:mm น.", { locale: th })],
    [""],
    ["[เงื่อนไขตัวกรองข้อมูล]"],
    ["ช่วงวันที่:", dateRangeText],
    ["ห้องประชุม:", filters.room === "all" ? "ทุกห้อง" : filters.room],
    ["สถานะ:", filters.status === "all" ? "ทุกสถานะ" : getStatusThaiText(filters.status)],
    ["ผู้จอง:", filters.userName && filters.userName !== "all" ? filters.userName : "ทั้งหมด"],
    ["คำค้นหา:", filters.search || "-"],
    [""],
    ["[สรุปสถิติการใช้งาน]"],
    ["จำนวนการจองทั้งหมด:", stats.total],
    ["จำนวนที่อนุมัติ/ใช้งาน:", stats.approved],
    ["จำนวนที่รออนุมัติ:", stats.pending],
    ["จำนวนที่ปฏิเสธ:", stats.rejected],
    ["จำนวนที่ยกเลิก:", stats.cancelled],
    ["ห้องประชุมยอดนิยม:", `${stats.popularRoom.name} (${stats.popularRoom.count} ครั้ง)`],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths for Sheet 1
  wsSummary["!cols"] = [{ wch: 25 }, { wch: 45 }];

  XLSX.utils.book_append_sheet(wb, wsSummary, "ARIT E-ROOMs Summary");

  // ==================== Sheet 2: Booking Details ====================
  const detailsHeader = [
    "ลำดับ",
    "วันที่จอง",
    "เวลา",
    "ห้องประชุม",
    "ผู้จอง",
    "อีเมล/หน่วยงาน",
    "วัตถุประสงค์",
    "สถานะ",
    "วันที่สร้างรายการ",
  ];

  const detailsRows = bookings.map((b, idx) => {
    let dateStr = "-";
    if (b.date) {
      try {
        dateStr = format(new Date(b.date), "dd/MM/yyyy", { locale: th });
      } catch {
        dateStr = b.date;
      }
    }

    let createdStr = "-";
    if (b.createdAt) {
      try {
        createdStr = format(new Date(b.createdAt), "dd/MM/yyyy HH:mm", { locale: th });
      } catch {
        createdStr = String(b.createdAt);
      }
    }

    return [
      idx + 1,
      dateStr,
      `${b.startTime || ""} - ${b.endTime || ""}`,
      b.roomName || "ไม่ระบุห้อง",
      b.userName || "-",
      b.department || b.email || "-",
      b.topic || "-",
      getStatusThaiText(b.status),
      createdStr,
    ];
  });

  const wsDetails = XLSX.utils.aoa_to_sheet([detailsHeader, ...detailsRows]);

  // Set column widths for Sheet 2
  wsDetails["!cols"] = [
    { wch: 8 },  // ลำดับ
    { wch: 14 }, // วันที่จอง
    { wch: 16 }, // เวลา
    { wch: 22 }, // ห้องประชุม
    { wch: 22 }, // ผู้จอง
    { wch: 25 }, // อีเมล/หน่วยงาน
    { wch: 30 }, // วัตถุประสงค์
    { wch: 14 }, // สถานะ
    { wch: 18 }, // วันที่สร้างรายการ
  ];

  XLSX.utils.book_append_sheet(wb, wsDetails, "Booking Details");

  // ==================== Sheet 3: Room Statistics ====================
  const roomStatsHeader = [
    "ห้องประชุม",
    "จำนวนการจองทั้งหมด",
    "อนุมัติ",
    "รออนุมัติ",
    "ปฏิเสธ",
    "ยกเลิก",
  ];

  const roomStatsRows = roomStats.map((r) => [
    r.roomName,
    r.total,
    r.approved,
    r.pending,
    r.rejected,
    r.cancelled,
  ]);

  const wsRoomStats = XLSX.utils.aoa_to_sheet([roomStatsHeader, ...roomStatsRows]);

  // Set column widths for Sheet 3
  wsRoomStats["!cols"] = [
    { wch: 25 }, // ห้องประชุม
    { wch: 18 }, // ทั้งหมด
    { wch: 12 }, // อนุมัติ
    { wch: 12 }, // รออนุมัติ
    { wch: 12 }, // ปฏิเสธ
    { wch: 12 }, // ยกเลิก
  ];

  XLSX.utils.book_append_sheet(wb, wsRoomStats, "Room Statistics");

  // ==================== Generate Filename ====================
  const dateSuffix =
    filters.dateRange === "custom" && filters.startDate && filters.endDate
      ? `${filters.startDate}_to_${filters.endDate}`
      : format(new Date(), "yyyy-MM-dd");

  const sanitizedRoom =
    filters.room !== "all"
      ? `_${filters.room.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "_")}`
      : "";

  const fileName = `ARIT-E-ROOMs_Report_${dateSuffix}${sanitizedRoom}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fileName);

  return fileName;
}
