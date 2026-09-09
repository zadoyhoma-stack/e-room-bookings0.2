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
  Eye,
  Calendar,
  Clock,
  User,
  Building2,
  Users,
  FileText,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingReportTableProps {
  bookings: any[];
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isExporting?: string | null;
}

export const BookingReportTable: React.FC<BookingReportTableProps> = ({
  bookings,
  onExportExcel,
  onExportPdf,
  isExporting,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const totalPages = Math.max(1, Math.ceil(bookings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = bookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden mb-6">
        {/* Table Header Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  ตารางรายงานข้อมูลการจอง
                </h3>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full font-extrabold text-xs">
                  พบข้อมูล {bookings.length} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                แสดงข้อมูลการจองตามเงื่อนไขตัวกรองปัจจุบัน สามารถส่งออกเป็นไฟล์ Excel หรือ PDF ได้ทันที
              </p>
            </div>
          </div>

          {/* Quick Export Bar & Rows selector */}
          <div className="flex flex-wrap items-center gap-3">
            {onExportExcel && (
              <Button
                size="sm"
                onClick={onExportExcel}
                disabled={bookings.length === 0 || !!isExporting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> ส่งออก Excel
              </Button>
            )}

            {onExportPdf && (
              <Button
                size="sm"
                onClick={onExportPdf}
                disabled={bookings.length === 0 || !!isExporting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20"
              >
                <FileIcon className="w-4 h-4 mr-1.5" /> ส่งออก PDF
              </Button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-2 border-l border-slate-200 dark:border-slate-700">
              <span>แสดง:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value={20}>20 รายการ</option>
                <option value={50}>50 รายการ</option>
                <option value={100}>100 รายการ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ลำดับ</th>
                <th className="px-6 py-4">วันที่จอง</th>
                <th className="px-6 py-4">เวลา</th>
                <th className="px-6 py-4">ห้องประชุม</th>
                <th className="px-6 py-4">ผู้จอง</th>
                <th className="px-6 py-4">อีเมล / หน่วยงาน</th>
                <th className="px-6 py-4">วัตถุประสงค์</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                currentData.map((b, idx) => {
                  let dateDisplay = "-";
                  if (b.date) {
                    try {
                      dateDisplay = format(new Date(b.date), "dd MMM yyyy", { locale: th });
                    } catch {
                      dateDisplay = b.date;
                    }
                  }

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 font-bold">{startIndex + idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {dateDisplay}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                        {b.startTime} - {b.endTime}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {b.roomName || "ไม่ระบุห้อง"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {b.userName || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[160px]">
                        {b.department || b.email || "-"}
                      </td>
                      <td
                        className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate"
                        title={b.topic}
                      >
                        {b.topic || "-"}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedBooking(b)}
                          className="rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> ดูรายละเอียด
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 font-medium">
            แสดง {bookings.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, bookings.length)} จากทั้งหมด {bookings.length} รายการ
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border-slate-200 dark:border-slate-700 h-8 px-3 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> ก่อนหน้า
              </Button>
              <span className="font-bold text-slate-600 dark:text-slate-300 px-2">
                หน้า {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border-slate-200 dark:border-slate-700 h-8 px-3 text-xs"
              >
                ถัดไป <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  รายละเอียดการจองห้องประชุม
                </DialogTitle>
                <StatusBadge status={selectedBooking.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 my-2 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> ห้องประชุม
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                    {selectedBooking.roomName || "ไม่ระบุห้อง"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> วันที่ใช้งาน
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedBooking.date}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> เวลา
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedBooking.startTime} - {selectedBooking.endTime} น.
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> จำนวนผู้เข้าร่วม
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedBooking.attendees || selectedBooking.participants || "-"} คน
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> ข้อมูลผู้จอง
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.userName || "-"}</p>
                  <p className="text-xs text-slate-500">{selectedBooking.email || "-"}</p>
                  <p className="text-xs text-slate-500">{selectedBooking.department || "-"}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block mb-1">วัตถุประสงค์ในการใช้ห้อง</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-medium">
                    {selectedBooking.topic || selectedBooking.purpose || "ไม่มีระบุ"}
                  </p>
                </div>

                {selectedBooking.createdAt && (
                  <div className="text-xs text-slate-400 pt-2 flex justify-between">
                    <span>วันที่ทำรายการ:</span>
                    <span>{String(selectedBooking.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
