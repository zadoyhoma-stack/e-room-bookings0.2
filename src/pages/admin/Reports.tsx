import { useState } from "react";
import { Download, FileText, Calendar, Filter, FileSpreadsheet, FileIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const mockReports = [
  { id: "1", date: "2023-10-01", type: "การใช้งานรายวัน", room: "ห้องประชุม A", bookings: 5, status: "Generated" },
  { id: "2", date: "2023-10-02", type: "สรุปรายสัปดาห์", room: "ทุกห้อง", bookings: 42, status: "Generated" },
  { id: "3", date: "2023-10-03", type: "ภาพรวมรายเดือน", room: "ทุกห้อง", bookings: 180, status: "Pending" },
  { id: "4", date: "2023-10-04", type: "รายงานความเสียหาย", room: "ห้องประชุม B", bookings: 0, status: "Generated" },
];

const Reports = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const handleExport = (format: string) => {
    toast({
      title: `กำลังส่งออกเป็น ${format}`,
      description: "ระบบกำลังเตรียมไฟล์รายงานให้คุณสักครู่",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            รายงานและการวิเคราะห์
          </h1>
          <p className="text-slate-500 mt-2">สร้าง ดู และส่งออกรายงานการจองห้องและการวิเคราะห์ระบบ</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 h-11 px-6">
              <Download className="w-4 h-4 mr-2" /> ส่งออกข้อมูล
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
            <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleExport("PDF")}>
              <FileIcon className="w-4 h-4 mr-2 text-rose-500" /> ส่งออกเป็น PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer py-2" onClick={() => handleExport("Excel")}>
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" /> ส่งออกเป็น Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Filter Card */}
        <Card className="col-span-1 border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px]">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-indigo-500" /> กรองรายงาน
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500">ประเภทรายงาน</label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">ทุกประเภท</SelectItem>
                      <SelectItem value="daily">การใช้งานรายวัน</SelectItem>
                      <SelectItem value="weekly">สรุปรายสัปดาห์</SelectItem>
                      <SelectItem value="monthly">ภาพรวมรายเดือน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500">ช่วงเวลา</label>
                  <div className="flex items-center gap-2">
                    <Input type="date" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    <span className="text-slate-400">ถึง</span>
                    <Input type="date" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500">ค้นหา</label>
                  <Input 
                    placeholder="ค้นหาด้วยชื่อหรือห้อง..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200" 
                  />
                </div>
              </div>
            </div>

            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11">
              ใช้ตัวกรอง
            </Button>
          </div>
        </Card>

        {/* Data Table */}
        <Card className="col-span-1 md:col-span-2 border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">วันที่</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">ประเภทรายงาน</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">เป้าหมาย</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" /> {report.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {report.room}
                    </td>
                    <td className="px-6 py-4">
                      {report.status === "Generated" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                          พร้อมใช้งาน
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
                          กำลังประมวลผล
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg border-slate-200 hover:bg-slate-50"
                        disabled={report.status !== "Generated"}
                        onClick={() => handleExport("PDF")}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> ดาวน์โหลด
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-sm text-slate-500">แสดงผล 4 รายงาน</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
