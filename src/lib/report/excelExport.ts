import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ReportFilterState, ReportSummaryStats, RoomStatistic, getStatusThaiText } from "./reportUtils";

/** Helper to apply border to a cell */
function applyBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };
}

/** Helper to apply header style to a cell */
function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF475569' } // Slate-600
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  applyBorder(cell);
}

export async function exportToExcel(
  bookings: any[],
  filters: ReportFilterState,
  stats: ReportSummaryStats,
  roomStats: RoomStatistic[],
  problems: any[] = [],
  evaluations: any[] = []
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ARIT E-ROOMs';
  wb.created = new Date();

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
  const wsSummary = wb.addWorksheet('หน้าสรุปข้อมูล (Summary)'); // Gridlines default to true

  wsSummary.columns = [
    { width: 45 }, { width: 55 }
  ];

  // Original plain layout
  wsSummary.addRow(["ระบบจองห้องประชุมออนไลน์ ARIT E-ROOMs"]);
  wsSummary.getCell('A1').font = { bold: true };
  wsSummary.addRow(["รายงานสรุปการใช้ห้องประชุม"]);
  wsSummary.addRow(["สำนักวิทยบริการและเทคโนโลยีสารสนเทศ มหาวิทยาลัยราชภัฏมหาสารคาม"]);
  wsSummary.addRow([]);
  wsSummary.addRow(["วันที่พิมพ์รายงาน:", format(new Date(), "dd MMMM yyyy เวลา HH:mm น.", { locale: th })]);
  wsSummary.addRow([]);

  wsSummary.addRow(["[เงื่อนไขที่ใช้กรองข้อมูล]"]);
  wsSummary.lastRow!.getCell(1).font = { bold: true };
  
  wsSummary.addRow(["ช่วงวันที่:", dateRangeText]);
  wsSummary.addRow(["ห้องประชุม:", filters.room === "all" ? "ทุกห้อง" : filters.room]);
  wsSummary.addRow(["สถานะการจอง:", filters.status === "all" ? "ทุกสถานะ" : getStatusThaiText(filters.status)]);
  wsSummary.addRow(["ผู้จอง:", filters.userName && filters.userName !== "all" ? filters.userName : "ทั้งหมด"]);
  wsSummary.addRow(["คำค้นหาเพิ่มเติม:", filters.search || "-"]);
  
  wsSummary.addRow([]);

  wsSummary.addRow(["[สรุปสถิติการใช้งานห้องประชุม]"]);
  wsSummary.lastRow!.getCell(1).font = { bold: true };

  wsSummary.addRow(["จำนวนการจองทั้งหมด:", `${stats.total} รายการ`]);
  wsSummary.addRow(["จำนวนที่อนุมัติ/ใช้งาน:", `${stats.approved} รายการ`]);
  wsSummary.addRow(["จำนวนที่รออนุมัติ:", `${stats.pending} รายการ`]);
  wsSummary.addRow(["จำนวนที่ปฏิเสธ:", `${stats.rejected} รายการ`]);
  wsSummary.addRow(["จำนวนที่ยกเลิก:", `${stats.cancelled} รายการ`]);
  wsSummary.addRow(["ห้องประชุมยอดนิยมอันดับ 1:", stats.popularRoom.name !== "-" ? `${stats.popularRoom.name} (${stats.popularRoom.count} ครั้ง)` : "-"]);

  // ==================== Sheet 2: Booking Details ====================
  const wsDetails = wb.addWorksheet('รายละเอียดการจอง (Details)');
  wsDetails.columns = [
    { header: "ลำดับ", key: "index", width: 10 },
    { header: "วันที่จอง", key: "date", width: 18 },
    { header: "เวลา", key: "time", width: 18 },
    { header: "ห้องประชุม", key: "room", width: 35 },
    { header: "ผู้จอง", key: "user", width: 30 },
    { header: "อีเมล/หน่วยงาน", key: "dept", width: 35 },
    { header: "วัตถุประสงค์", key: "topic", width: 45 },
    { header: "สถานะ", key: "status", width: 18 },
    { header: "วันที่สร้างรายการ", key: "created", width: 22 },
  ];

  // Style Header
  wsDetails.getRow(1).eachCell(applyHeaderStyle);

  bookings.forEach((b, idx) => {
    let dateStr = "-";
    if (b.date) {
      try { dateStr = format(new Date(b.date), "dd/MM/yyyy", { locale: th }); } catch { dateStr = b.date; }
    }
    let createdStr = "-";
    if (b.createdAt) {
      try { createdStr = format(new Date(b.createdAt), "dd/MM/yyyy HH:mm", { locale: th }); } catch { createdStr = String(b.createdAt); }
    }

    const row = wsDetails.addRow({
      index: idx + 1,
      date: dateStr,
      time: `${b.startTime || ""} - ${b.endTime || ""}`,
      room: b.roomName || "ไม่ระบุห้อง",
      user: b.userName || "-",
      dept: b.department || b.email || "-",
      topic: b.topic || "-",
      status: getStatusThaiText(b.status),
      created: createdStr,
    });

    row.eachCell((cell, colNum) => {
      applyBorder(cell);
      if ([1, 2, 3, 8, 9].includes(colNum)) { // Center align index, dates, times, status
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  // ==================== Sheet 3: Room Statistics ====================
  const wsRoomStats = wb.addWorksheet('สถิติรายห้อง (Room Stats)');
  wsRoomStats.columns = [
    { header: "ห้องประชุม", key: "room", width: 35 },
    { header: "จำนวนการจองทั้งหมด", key: "total", width: 22 },
    { header: "อนุมัติ", key: "approved", width: 15 },
    { header: "รออนุมัติ", key: "pending", width: 15 },
    { header: "ปฏิเสธ", key: "rejected", width: 15 },
    { header: "ยกเลิก", key: "cancelled", width: 15 },
  ];

  wsRoomStats.getRow(1).eachCell(applyHeaderStyle);

  roomStats.forEach((r) => {
    const row = wsRoomStats.addRow({
      room: r.roomName,
      total: r.total,
      approved: r.approved,
      pending: r.pending,
      rejected: r.rejected,
      cancelled: r.cancelled,
    });
    row.eachCell((cell, colNum) => {
      applyBorder(cell);
      if (colNum > 1) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // ==================== Sheet 4: Problem Reports ====================
  const wsProblems = wb.addWorksheet('แจ้งปัญหา (Problem Reports)');
  wsProblems.columns = [
    { header: "ลำดับ", key: "index", width: 10 },
    { header: "วันที่แจ้ง", key: "date", width: 22 },
    { header: "ห้อง", key: "room", width: 25 },
    { header: "ประเภทปัญหา", key: "type", width: 25 },
    { header: "รายละเอียด", key: "details", width: 50 },
    { header: "ความเร่งด่วน", key: "urgency", width: 18 },
    { header: "สถานะ", key: "status", width: 18 },
  ];

  wsProblems.getRow(1).eachCell(applyHeaderStyle);

  problems.forEach((p, idx) => {
    let dateStr = p.reportedAt;
    try { if (dateStr) dateStr = format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
    let urgencyStr = p.urgency === 'high' ? 'สูง' : p.urgency === 'medium' ? 'ปานกลาง' : 'ต่ำ';
    let statusStr = p.status === 'resolved' ? 'แก้ไขแล้ว' : 'รอดำเนินการ';

    const row = wsProblems.addRow({
      index: idx + 1,
      date: dateStr || "-",
      room: p.roomId || "-", 
      type: p.problemType || "-",
      details: p.details || "-",
      urgency: urgencyStr,
      status: statusStr
    });
    row.eachCell((cell, colNum) => {
      applyBorder(cell);
      if ([1, 2, 6, 7].includes(colNum)) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });

  // ==================== Sheet 5: Evaluations ====================
  const wsEvals = wb.addWorksheet('แบบประเมิน (Evaluations)');
  wsEvals.columns = [
    { header: "ลำดับ", key: "index", width: 10 },
    { header: "วันที่ประเมิน", key: "date", width: 22 },
    { header: "คะแนน (ดาว)", key: "rating", width: 18 },
    { header: "ข้อเสนอแนะ", key: "feedback", width: 60 },
  ];

  wsEvals.getRow(1).eachCell(applyHeaderStyle);

  evaluations.forEach((e, idx) => {
    let dateStr = e.submittedAt;
    try { if (dateStr) dateStr = format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
    
    const row = wsEvals.addRow({
      index: idx + 1,
      date: dateStr || "-",
      rating: e.rating || 0,
      feedback: e.feedback || "-"
    });
    row.eachCell((cell, colNum) => {
      applyBorder(cell);
      if ([1, 2, 3].includes(colNum)) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });

  // ==================== Generate Filename and Download ====================
  let dateSuffix = "All_Time";
  if (filters.dateRange === "today") dateSuffix = format(new Date(), "yyyyMMdd");
  else if (filters.dateRange === "custom" && filters.startDate && filters.endDate) dateSuffix = `${filters.startDate}_to_${filters.endDate}`;
  
  let sanitizedRoom = "";
  if (filters.room && filters.room !== "all") {
    sanitizedRoom = "_" + filters.room.replace(/[^a-zA-Z0-9ก-๙]/g, "").substring(0, 20);
  }

  const fileName = `ARIT-E-ROOMs_Report_${dateSuffix}${sanitizedRoom}.xlsx`;
  
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName);
}

// Standalone export functions for Problems and Evaluations
export async function exportProblemsToExcel(problems: any[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const wsProblems = wb.addWorksheet('แจ้งปัญหา (Problem Reports)');
  wsProblems.columns = [
    { header: "ลำดับ", key: "index", width: 10 },
    { header: "วันที่แจ้ง", key: "date", width: 22 },
    { header: "ห้อง", key: "room", width: 25 },
    { header: "ประเภทปัญหา", key: "type", width: 25 },
    { header: "รายละเอียด", key: "details", width: 50 },
    { header: "ความเร่งด่วน", key: "urgency", width: 18 },
    { header: "สถานะ", key: "status", width: 18 },
  ];
  wsProblems.getRow(1).eachCell(applyHeaderStyle);

  problems.forEach((p, idx) => {
    let dateStr = p.reportedAt;
    try { if (dateStr) dateStr = format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
    let urgencyStr = p.urgency === 'high' ? 'สูง' : p.urgency === 'medium' ? 'ปานกลาง' : 'ต่ำ';
    let statusStr = p.status === 'resolved' ? 'แก้ไขแล้ว' : 'รอดำเนินการ';

    const row = wsProblems.addRow({
      index: idx + 1,
      date: dateStr || "-",
      room: p.roomId || "-", 
      type: p.problemType || "-",
      details: p.details || "-",
      urgency: urgencyStr,
      status: statusStr
    });
    row.eachCell((cell, colNum) => {
      applyBorder(cell);
      if ([1, 2, 6, 7].includes(colNum)) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `ARIT-E-ROOMs_Problem_Reports_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}

export async function exportEvaluationsToExcel(evaluations: any[]): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const wsEvals = wb.addWorksheet('แบบประเมิน (Evaluations)');
  wsEvals.columns = [
    { header: "ลำดับ", key: "index", width: 10 },
    { header: "วันที่ประเมิน", key: "date", width: 22 },
    { header: "คะแนน (ดาว)", key: "rating", width: 18 },
    { header: "ข้อเสนอแนะ", key: "feedback", width: 60 },
  ];
  wsEvals.getRow(1).eachCell(applyHeaderStyle);

  evaluations.forEach((e, idx) => {
    let dateStr = e.submittedAt;
    try { if (dateStr) dateStr = format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: th }); } catch {}
    
    const row = wsEvals.addRow({
      index: idx + 1,
      date: dateStr || "-",
      rating: e.rating || 0,
      feedback: e.feedback || "-"
    });
    row.eachCell((cell, colNum) => {
      applyBorder(cell);
      if ([1, 2, 3].includes(colNum)) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `ARIT-E-ROOMs_Evaluations_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
