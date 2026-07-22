import { useState } from "react";
import { Activity, Search, Filter, Shield, User, DoorOpen, Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockLogs = [
  { id: "1", type: "booking", user: "Sompong Jaidee", action: "จองห้องประชุม A", time: "10 นาทีที่แล้ว", date: "วันนี้", icon: DoorOpen, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/40" },
  { id: "2", type: "security", user: "ระบบ", action: "พยายามเข้าสู่ระบบไม่สำเร็จจาก IP 192.168.1.10", time: "1 ชั่วโมงที่แล้ว", date: "วันนี้", icon: Shield, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/40" },
  { id: "3", type: "user", user: "แอดมิน", action: "อัปเดตสิทธิ์การใช้งานสำหรับ John Doe", time: "3 ชั่วโมงที่แล้ว", date: "วันนี้", icon: User, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  { id: "4", type: "system", user: "ระบบ", action: "สำรองข้อมูลฐานข้อมูลประจำสัปดาห์สำเร็จ", time: "1 วันที่แล้ว", date: "เมื่อวาน", icon: SettingsIcon, color: "text-slate-500", bg: "bg-slate-200 dark:bg-slate-800" },
];

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            บันทึกกิจกรรม
          </h1>
          <p className="text-slate-500 mt-2">ตรวจสอบเหตุการณ์ของระบบ การกระทำของผู้ใช้ และการแจ้งเตือนความปลอดภัย</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="ค้นหาบันทึกกิจกรรม..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white backdrop-blur-md shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
          <Filter className="w-4 h-4 mr-2" /> กรองบันทึก
        </Button>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8">
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 md:ml-6 space-y-8 pb-4">
          {mockLogs.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="relative pl-8 md:pl-12">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 p-2 rounded-full border-4 border-white dark:border-slate-900 ${log.bg} ${log.color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Content */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px]">{log.action}</h4>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap self-start">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    ผู้ใช้: <span className="font-semibold text-slate-700 dark:text-slate-300">{log.user}</span> &bull; {log.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogs;
