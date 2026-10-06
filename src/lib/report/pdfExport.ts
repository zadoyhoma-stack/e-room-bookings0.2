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

async function loadImageBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawOfficialHeader(doc: jsPDF, logoBase64: string | null, pageWidth: number, margin: number, title: string, subtitle?: string) {
  let currentY = 15;
  if (logoBase64) {
    try {
      const imgProps = doc.getImageProperties(logoBase64);
      const ratio = imgProps.width / imgProps.height;
      const imgHeight = 24;
      const imgWidth = imgHeight * ratio;
      doc.addImage(logoBase64, 'PNG', pageWidth / 2 - (imgWidth / 2), currentY, imgWidth, imgHeight);
      currentY += imgHeight + 12;
    } catch (e) {
      doc.addImage(logoBase64, 'PNG', pageWidth / 2 - 12, currentY, 24, 24);
      currentY += 36;
    }
  } else {
    currentY += 10;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  
  currentY += 7;
  doc.setFontSize(14);
  doc.text("สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏมหาสารคาม", pageWidth / 2, currentY, { align: "center" });

  if (subtitle) {
    currentY += 6;
    doc.setFontSize(12);
    doc.text(subtitle, pageWidth / 2, currentY, { align: "center" });
  }

  currentY += 4;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  
  currentY += 8;
  return currentY;
}

function drawSignature(doc: jsPDF, pageWidth: number, margin: number, currentY: number) {
  if (currentY > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    currentY = margin + 10;
  }
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("ลงชื่อ .............................................................. ผู้จัดทำรายงาน", pageWidth - margin - 100, currentY);
  doc.text("( .............................................................. )", pageWidth - margin - 100 + 10, currentY + 8);
  doc.text("ตำแหน่ง ..............................................................", pageWidth - margin - 100 + 5, currentY + 16);
}

function drawFooter(doc: jsPDF, pageWidth: number, margin: number) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("Sarabun");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.text(`หน้า ${i} / ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
    doc.text("ARIT E-ROOMs - ระบบจองห้องประชุมออนไลน์", margin, footerY);
  }
}

export async function exportToPdf(
  bookings: any[],
  filters: ReportFilterState,
  stats: ReportSummaryStats,
  roomStats: RoomStatistic[],
  problems: any[] = [],
  evaluations: any[] = []
): Promise<string> {
  const fontBase64 = await loadSarabunFont();
  const logoBase64 = await loadImageBase64("/university-logo.png");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = drawOfficialHeader(doc, logoBase64, pageWidth, margin, "รายงานสรุปสถิติการใช้ห้องประชุมออนไลน์ (ARIT E-ROOMs)");

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`วันที่ออกรายงาน: ${format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })}`, pageWidth - margin, currentY, { align: "right" });

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

  doc.text(`ช่วงวันที่: ${dateRangeText}`, margin, currentY);
  currentY += 5;
  doc.text(`ห้องประชุม: ${filters.room === "all" ? "ทุกห้อง" : filters.room}`, margin, currentY);
  doc.text(`สถานะ: ${filters.status === "all" ? "ทุกสถานะ" : getStatusThaiText(filters.status)}`, margin + 60, currentY);
  doc.text(`ผู้จอง: ${filters.userName && filters.userName !== "all" ? filters.userName : "ทั้งหมด"}`, margin + 120, currentY);

  currentY += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("1. สรุปสถิติการใช้งาน", margin, currentY);

  currentY += 3;
  autoTable(doc, {
    startY: currentY,
    head: [["การจองทั้งหมด", "อนุมัติ/ใช้งาน", "รออนุมัติ", "ปฏิเสธ", "ยกเลิก", "ห้องยอดนิยม"]],
    body: [[String(stats.total), String(stats.approved), String(stats.pending), String(stats.rejected), String(stats.cancelled), stats.popularRoom.name]],
    styles: { font: "Sarabun", fontSize: 10, cellPadding: 3, halign: "center", textColor: 0, lineColor: 0, lineWidth: 0.15 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal", halign: "center" },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("2. สถิติการใช้ห้องประชุมแยกตามห้อง", margin, currentY);

  currentY += 3;
  const roomTableRows = roomStats.map((r) => [r.roomName, String(r.total), String(r.approved), String(r.pending), String(r.rejected), String(r.cancelled)]);
  autoTable(doc, {
    startY: currentY,
    head: [["ห้องประชุม", "จำนวนการจองทั้งหมด", "อนุมัติ", "รออนุมัติ", "ปฏิเสธ", "ยกเลิก"]],
    body: roomTableRows.length > 0 ? roomTableRows : [["ไม่มีข้อมูล", "0", "0", "0", "0", "0"]],
    styles: { font: "Sarabun", fontSize: 10, cellPadding: 3, halign: "center", textColor: 0, lineColor: 0, lineWidth: 0.15 },
    columnStyles: { 0: { halign: "left" } },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal", halign: "center" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`3. รายละเอียดการจอง (${bookings.length} รายการ)`, margin, currentY);

  currentY += 3;
  const bookingRows = bookings.map((b, idx) => {
    let dateStr = "-";
    if (b.date) {
      try { dateStr = format(new Date(b.date), "dd/MM/yyyy", { locale: th }); } catch { dateStr = b.date; }
    }
    return [String(idx + 1), dateStr, `${b.startTime || ""}-${b.endTime || ""}`, b.roomName || "-", b.userName || "-", b.topic || "-", getStatusThaiText(b.status)];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["ลำดับ", "วันที่", "เวลา", "ห้องประชุม", "ผู้จอง", "วัตถุประสงค์", "สถานะ"]],
    body: bookingRows.length > 0 ? bookingRows : [["-", "-", "-", "-", "-", "ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก", "-"]],
    styles: { font: "Sarabun", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  if (problems.length > 0) {
    if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = margin; }
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`4. รายการแจ้งปัญหา (${problems.length} รายการ)`, margin, currentY);
    currentY += 3;

    const problemRows = problems.map((p, idx) => {
      let dateStr = p.reportedAt || "-";
      try { if (p.reportedAt) dateStr = format(new Date(p.reportedAt), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
      let urgencyStr = p.urgency === 'high' ? 'สูง' : p.urgency === 'medium' ? 'ปานกลาง' : 'ต่ำ';
      let statusStr = p.status === 'resolved' ? 'แก้ไขแล้ว' : 'รอดำเนินการ';
      return [String(idx + 1), dateStr, p.roomId || "-", p.problemType || "-", p.details || "-", urgencyStr, statusStr];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["ลำดับ", "วันที่แจ้ง", "ห้อง", "ประเภทปัญหา", "รายละเอียด", "ความเร่งด่วน", "สถานะ"]],
      body: problemRows,
      styles: { font: "Sarabun", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15 },
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal" },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  if (evaluations.length > 0) {
    if (currentY > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); currentY = margin; }
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`5. รายการประเมินความพึงพอใจ (${evaluations.length} รายการ)`, margin, currentY);
    currentY += 3;

    const evalRows = evaluations.map((e, idx) => {
      let dateStr = e.submittedAt || "-";
      try { if (e.submittedAt) dateStr = format(new Date(e.submittedAt), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
      return [String(idx + 1), dateStr, String(e.rating || 0), e.feedback || "-"];
    });

    autoTable(doc, {
      startY: currentY,
      head: [["ลำดับ", "วันที่ประเมิน", "คะแนน (ดาว)", "ข้อเสนอแนะ"]],
      body: evalRows,
      styles: { font: "Sarabun", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15 },
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal" },
      alternateRowStyles: { fillColor: [252, 252, 252] },
      margin: { left: margin, right: margin },
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  currentY += 10;
  drawSignature(doc, pageWidth, margin, currentY);
  drawFooter(doc, pageWidth, margin);

  const dateSuffix = filters.dateRange === "custom" && filters.startDate && filters.endDate ? `${filters.startDate}_to_${filters.endDate}` : format(new Date(), "yyyy-MM-dd");
  const sanitizedRoom = filters.room !== "all" ? `_${filters.room.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "_")}` : "";
  const fileName = `ARIT-E-ROOMs_Report_${dateSuffix}${sanitizedRoom}.pdf`;
  doc.save(fileName);
  return fileName;
}

export async function exportProblemsToPdf(problems: any[]): Promise<string> {
  const fontBase64 = await loadSarabunFont();
  const logoBase64 = await loadImageBase64("/university-logo.png");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = drawOfficialHeader(doc, logoBase64, pageWidth, margin, "รายงานแจ้งปัญหาการใช้งานห้องประชุมออนไลน์");

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`วันที่ออกรายงาน: ${format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })}`, pageWidth - margin, currentY, { align: "right" });
  currentY += 8;

  const problemRows = problems.map((p, idx) => {
    let dateStr = p.reportedAt || "-";
    try { if (p.reportedAt) dateStr = format(new Date(p.reportedAt), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
    let urgencyStr = p.urgency === 'high' ? 'สูง' : p.urgency === 'medium' ? 'ปานกลาง' : 'ต่ำ';
    let statusStr = p.status === 'resolved' ? 'แก้ไขแล้ว' : 'รอดำเนินการ';
    return [String(idx + 1), dateStr, p.roomId || "-", p.problemType || "-", p.details || "-", urgencyStr, statusStr];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["ลำดับ", "วันที่แจ้ง", "ห้อง", "ประเภทปัญหา", "รายละเอียด", "ความเร่งด่วน", "สถานะ"]],
    body: problemRows.length > 0 ? problemRows : [["-","-","-","ไม่พบข้อมูลปัญหา","-","-","-"]],
    styles: { font: "Sarabun", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;
  drawSignature(doc, pageWidth, margin, currentY);
  drawFooter(doc, pageWidth, margin);

  const fileName = `ARIT-E-ROOMs_Problem_Reports_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
  return fileName;
}

export async function exportEvaluationsToPdf(evaluations: any[]): Promise<string> {
  const fontBase64 = await loadSarabunFont();
  const logoBase64 = await loadImageBase64("/university-logo.png");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = drawOfficialHeader(doc, logoBase64, pageWidth, margin, "รายงานผลประเมินความพึงพอใจ ระบบจองห้องประชุมออนไลน์");

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`วันที่ออกรายงาน: ${format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })}`, pageWidth - margin, currentY, { align: "right" });
  currentY += 8;

  const evalRows = evaluations.map((e, idx) => {
    let dateStr = e.submittedAt || "-";
    try { if (e.submittedAt) dateStr = format(new Date(e.submittedAt), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
    return [String(idx + 1), dateStr, String(e.rating || 0), e.feedback || "-"];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["ลำดับ", "วันที่ประเมิน", "คะแนน (ดาว)", "ข้อเสนอแนะ"]],
    body: evalRows.length > 0 ? evalRows : [["-","-","ไม่พบข้อมูลประเมิน","-"]],
    styles: { font: "Sarabun", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;
  drawSignature(doc, pageWidth, margin, currentY);
  drawFooter(doc, pageWidth, margin);

  const fileName = `ARIT-E-ROOMs_Evaluations_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
  return fileName;
}

export async function exportBookingsOfficialToPdf(bookings: any[], tabName: string): Promise<string> {
  const fontBase64 = await loadSarabunFont();
  const logoBase64 = await loadImageBase64("/university-logo.png");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  doc.addFileToVFS("Sarabun-Regular.ttf", fontBase64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun");
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = drawOfficialHeader(doc, logoBase64, pageWidth, margin, "รายงานการจองห้องประชุมออนไลน์");

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`วันที่ออกรายงาน: ${format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })}`, pageWidth - margin, currentY, { align: "right" });
  doc.text(`เงื่อนไข: ${tabName}`, margin, currentY);
  currentY += 8;

  const bookingRows = bookings.map((b, idx) => {
    let dateStr = "-";
    if (b.date) {
      try { dateStr = format(new Date(b.date), "dd/MM/yyyy", { locale: th }); } catch { dateStr = b.date; }
    }
    return [String(idx + 1), dateStr, `${b.startTime || ""}-${b.endTime || ""}`, b.roomName || "-", b.userName || "-", b.topic || "-", getStatusThaiText(b.status)];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["ลำดับ", "วันที่", "เวลา", "ห้องประชุม", "ผู้จอง", "วัตถุประสงค์", "สถานะ"]],
    body: bookingRows.length > 0 ? bookingRows : [["-", "-", "-", "-", "-", "ไม่พบข้อมูลการจอง", "-"]],
    styles: { font: "Sarabun", fontSize: 9, cellPadding: 2, textColor: 0, lineColor: 0, lineWidth: 0.15 },
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 10, fontStyle: "normal" },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;
  drawSignature(doc, pageWidth, margin, currentY);
  drawFooter(doc, pageWidth, margin);

  const fileName = `ARIT-E-ROOMs_Staff_Bookings_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
  return fileName;
}
