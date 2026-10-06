import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Cache font ArrayBuffer to avoid re-fetching
let fontCache: string | null = null;

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

async function loadSarabunFont(): Promise<string> {
  if (fontCache) return fontCache;

  try {
    const response = await fetch("/fonts/Sarabun-Regular.ttf");
    if (!response.ok) throw new Error("Font download failed");
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to base64
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

export const exportToPdf = async (data: any[], filters: any, stats: any): Promise<string> => {
  // Load Thai font first
  const fontBase64 = await loadSarabunFont();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Register Sarabun font
  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // === HEADER ===
  doc.setFontSize(18);
  doc.text("รายงานสรุปการจองห้องประชุม", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text("ARIT E-ROOMs", pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text("สำนักวิทยบริการและเทคโนโลยีสารสนเทศ", pageWidth / 2, 34, { align: "center" });
  doc.text("มหาวิทยาลัยราชภัฏมหาสารคาม", pageWidth / 2, 39, { align: "center" });

  // Divider line
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.setLineWidth(0.5);
  doc.line(margin, 43, pageWidth - margin, 43);

  // === REPORT INFO ===
  doc.setFontSize(9);
  doc.setTextColor(100);
  const infoY = 49;
  doc.text(`วันที่สร้างรายงาน: ${format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })}`, margin, infoY);

  const dateRangeLabels: Record<string, string> = {
    all: "ทั้งหมด",
    today: "วันนี้",
    "7days": "7 วันที่ผ่านมา",
    thisMonth: "เดือนนี้",
    lastMonth: "เดือนที่ผ่านมา",
    thisYear: "ปีนี้",
  };
  doc.text(`ช่วงวันที่: ${dateRangeLabels[filters.dateRange] || filters.dateRange}`, margin, infoY + 5);
  doc.text(`ห้องประชุม: ${filters.room === "all" ? "ทุกห้อง" : filters.room}`, margin, infoY + 10);

  const statusLabels: Record<string, string> = {
    all: "ทุกสถานะ",
    pending: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
    cancelled: "ยกเลิก",
    completed: "เสร็จสิ้น",
  };
  doc.text(`สถานะ: ${statusLabels[filters.status] || filters.status}`, margin, infoY + 15);

  // === SUMMARY STATS ===
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text("สรุปสถิติ", margin, infoY + 24);

  doc.setFontSize(10);
  const summaryStartY = infoY + 30;
  const summaryItems = [
    { label: "การจองทั้งหมด:", value: String(stats.total) },
    { label: "อนุมัติแล้ว/ใช้งาน:", value: String(stats.approved) },
    { label: "ยกเลิก/ไม่อนุมัติ:", value: String(stats.rejected) },
  ];

  summaryItems.forEach((item, idx) => {
    doc.text(item.label, margin + 4, summaryStartY + idx * 6);
    doc.text(item.value, margin + 50, summaryStartY + idx * 6);
  });

  // === BOOKING DETAILS TABLE ===
  const tableStartY = summaryStartY + summaryItems.length * 6 + 8;
  doc.setFontSize(12);
  doc.text(`รายละเอียดการจอง (${data.length} รายการ)`, margin, tableStartY);

  if (data.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก", pageWidth / 2, tableStartY + 10, { align: "center" });
  } else {
    const tableData = data.map((b, idx) => [
      String(idx + 1),
      safeFormatDate(b.date, "dd/MM/yyyy"),
      `${b.startTime || "-"}-${b.endTime || "-"}`,
      b.roomName || "-",
      b.userName || "-",
      b.topic || "-",
      statusLabels[b.status] || b.status,
    ]);

    autoTable(doc, {
      startY: tableStartY + 4,
      head: [["ลำดับ", "วันที่", "เวลา", "ห้อง", "ผู้จอง", "วัตถุประสงค์", "สถานะ"]],
      body: tableData,
      styles: {
        font: "Sarabun",
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "normal",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: margin, right: margin },
      didDrawPage: (pageData) => {
        // Footer with page number
        const pageCount = doc.getNumberOfPages();
        doc.setFont("Sarabun");
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `หน้า ${pageData.pageNumber} / ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
        doc.text(
          "ARIT E-ROOMs - ระบบจองห้องประชุมออนไลน์",
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: "center" }
        );
      },
    });
  }

  // Fix page numbers (jspdf-autotable creates pages dynamically, so we need to update page count)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("Sarabun");
    doc.setFontSize(8);
    doc.setTextColor(150);
    // Clear and redraw footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.text(`หน้า ${i} / ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
  }

  // Generate filename and save
  const fileName = `ARIT-E-ROOMs_Report_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
  doc.save(fileName);

  return fileName;
};
