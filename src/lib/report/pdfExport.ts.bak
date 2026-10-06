import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ReportFilterState, ReportSummaryStats, RoomStatistic, getStatusThaiText } from "./reportUtils";

let fontCache: string | null = null;

async function loadSarabunFont(): Promise<string> {
  if (fontCache) return fontCache;

  try {
    const response = await fetch("/fonts/Sarabun-Regular.ttf");
    if (!response.ok) throw new Error("Font download failed");
    const arrayBuffer = await response.arrayBuffer();

    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    fontCache = btoa(binary);
    return fontCache;
  } catch (err) {
    console.error("Failed to load Sarabun font:", err);
    throw new Error("ไม่สามารถโหลดฟอนต์ภาษาไทยได้ กรุณาตรวจสอบไฟล์ Sarabun-Regular.ttf ใน public/fonts/");
  }
}

export async function exportToPdf(
  bookings: any[],
  filters: ReportFilterState,
  stats: ReportSummaryStats,
  roomStats: RoomStatistic[]
): Promise<string> {
  const fontBase64 = await loadSarabunFont();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Register Thai Sarabun font
  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ==================== PDF HEADER ====================
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("รายงานสรุปการใช้ห้องประชุม", pageWidth / 2, 18, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text("ARIT E-ROOMs", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏมหาสารคาม", pageWidth / 2, 31, { align: "center" });

  // Divider line
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.setLineWidth(0.5);
  doc.line(margin, 35, pageWidth - margin, 35);

  // ==================== REPORT FILTER INFO ====================
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  let currentY = 41;

  doc.text(`วันที่สร้างรายงาน: ${format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })}`, margin, currentY);

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

  currentY += 5;
  doc.text(`ช่วงวันที่: ${dateRangeText}`, margin, currentY);
  doc.text(`ห้องประชุม: ${filters.room === "all" ? "ทุกห้อง" : filters.room}`, margin + 80, currentY);

  currentY += 5;
  doc.text(`สถานะ: ${filters.status === "all" ? "ทุกสถานะ" : getStatusThaiText(filters.status)}`, margin, currentY);
  doc.text(`ผู้จอง: ${filters.userName && filters.userName !== "all" ? filters.userName : "ทั้งหมด"}`, margin + 80, currentY);

  // ==================== SUMMARY STATISTICS ====================
  currentY += 9;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. สรุปสถิติการใช้งาน", margin, currentY);

  currentY += 3;
  const summaryTableData = [
    [
      String(stats.total),
      String(stats.approved),
      String(stats.pending),
      String(stats.rejected),
      String(stats.cancelled),
      stats.popularRoom.name,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["การจองทั้งหมด", "อนุมัติ/ใช้งาน", "รออนุมัติ", "ปฏิเสธ", "ยกเลิก", "ห้องยอดนิยม"]],
    body: summaryTableData,
    styles: { font: "Sarabun", fontSize: 8, cellPadding: 2.5, halign: "center" },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8.5, fontStyle: "normal" },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ==================== ROOM STATISTICS ====================
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. สถิติการใช้ห้องประชุมแยกตามห้อง", margin, currentY);

  currentY += 3;
  const roomTableRows = roomStats.map((r) => [
    r.roomName,
    String(r.total),
    String(r.approved),
    String(r.pending),
    String(r.rejected),
    String(r.cancelled),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["ห้องประชุม", "จำนวนการจองทั้งหมด", "อนุมัติ", "รออนุมัติ", "ปฏิเสธ", "ยกเลิก"]],
    body: roomTableRows.length > 0 ? roomTableRows : [["ไม่มีข้อมูล", "0", "0", "0", "0", "0"]],
    styles: { font: "Sarabun", fontSize: 8, cellPadding: 2, halign: "center" },
    columnStyles: { 0: { halign: "left" } },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8.5, fontStyle: "normal" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ==================== BOOKING DETAILS TABLE ====================
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. รายละเอียดการจอง (${bookings.length} รายการ)`, margin, currentY);

  currentY += 3;
  const bookingRows = bookings.map((b, idx) => {
    let dateStr = "-";
    if (b.date) {
      try {
        dateStr = format(new Date(b.date), "dd/MM/yyyy", { locale: th });
      } catch {
        dateStr = b.date;
      }
    }

    return [
      String(idx + 1),
      dateStr,
      `${b.startTime || ""}-${b.endTime || ""}`,
      b.roomName || "-",
      b.userName || "-",
      b.topic || "-",
      getStatusThaiText(b.status),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["ลำดับ", "วันที่", "เวลา", "ห้องประชุม", "ผู้จอง", "วัตถุประสงค์", "สถานะ"]],
    body: bookingRows.length > 0 ? bookingRows : [["-", "-", "-", "-", "-", "ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก", "-"]],
    styles: { font: "Sarabun", fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: "normal" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Header/Footer handled dynamically after render
    },
  });

  // Footer page numbering pass
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("Sarabun");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400

    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.text(`หน้า ${i} / ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
    doc.text("ARIT E-ROOMs - ระบบจองห้องประชุมออนไลน์ สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มรภ.มหาสารคาม", margin, footerY);
  }

  // Generate Filename
  const dateSuffix =
    filters.dateRange === "custom" && filters.startDate && filters.endDate
      ? `${filters.startDate}_to_${filters.endDate}`
      : format(new Date(), "yyyy-MM-dd");

  const sanitizedRoom =
    filters.room !== "all"
      ? `_${filters.room.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "_")}`
      : "";

  const fileName = `ARIT-E-ROOMs_Report_${dateSuffix}${sanitizedRoom}.pdf`;
  doc.save(fileName);

  return fileName;
}
