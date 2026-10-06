import * as XLSX from "xlsx";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Safe Date Formatter
const safeFormatDate = (dateStr: string | null | undefined, formatStr: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, formatStr, { locale: th });
  } catch {
    return dateStr;
  }
};

export const exportToExcel = (data: any[], filters: any, stats: any) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ["รายงานสรุปการจองห้องประชุม", ""],
    ["ARIT E-ROOMs", ""],
    ["สำนักวิทยบริการและเทคโนโลยีสารสนเทศ", ""],
    ["มหาวิทยาลัยราชภัฏมหาสารคาม", ""],
    [""],
    ["วันที่พิมพ์รายงาน:", format(new Date(), "dd MMMM yyyy HH:mm", { locale: th })],
    ["เงื่อนไขการค้นหา:", ""],
    ["ช่วงวันที่:", filters.dateRange],
    ["ห้องประชุม:", filters.room === "all" ? "ทุกห้อง" : filters.room],
    ["สถานะ:", filters.status === "all" ? "ทุกสถานะ" : filters.status],
    [""],
    ["สรุปสถิติ:", ""],
    ["การจองทั้งหมด:", stats.total],
    ["อนุมัติแล้ว/ใช้งาน:", stats.approved],
    ["ยกเลิก/ไม่อนุมัติ:", stats.rejected],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "สรุปข้อมูล");

  // Sheet 2: Details
  const detailsData = data.map((b, idx) => ({
    "ลำดับ": idx + 1,
    "วันที่จอง": safeFormatDate(b.date, "dd MMM yyyy"),
    "เวลาเริ่ม": b.startTime || "-",
    "เวลาสิ้นสุด": b.endTime || "-",
    "ชื่อห้อง": b.roomName || "ไม่ระบุ",
    "ชื่อผู้จอง": b.userName || "-",
    "หน่วยงาน/คณะ": b.department || "-",
    "วัตถุประสงค์": b.topic || "-",
    "สถานะ": b.status === "approved" ? "อนุมัติแล้ว" : 
             b.status === "pending" ? "รออนุมัติ" :
             b.status === "rejected" ? "ปฏิเสธ" :
             b.status === "cancelled" ? "ยกเลิก" :
             b.status === "completed" ? "เสร็จสิ้น" : b.status
  }));

  const wsDetails = XLSX.utils.json_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, wsDetails, "รายละเอียดการจอง");

  // Generate filename
  const fileName = `ARIT-E-ROOMs_Report_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  return fileName;
};
