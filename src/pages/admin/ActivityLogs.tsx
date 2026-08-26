import { useState } from "react";
import { Search, Filter, Shield, User, DoorOpen, Settings as SettingsIcon, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import * as ds from "@/services/dataService";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimeMonitoring from "./RealTimeMonitoring";

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: systemLogs = [] } = useQuery<any[]>({
    queryKey: ["system_logs"],
    queryFn: () => ds.getSystemLogs(),
    refetchInterval: 10000
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case "booking": return { icon: DoorOpen, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/40" };
      case "security": return { icon: Shield, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/40" };
      case "user": return { icon: User, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/40" };
      default: return { icon: SettingsIcon, color: "text-slate-500", bg: "bg-slate-200 dark:bg-slate-800" };
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <Tabs defaultValue="live" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl shadow-inner">
            <TabsTrigger value="live" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold transition-all py-2.5">
              สถานะเรียลไทม์ (Live)
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold transition-all py-2.5">
              ประวัติการใช้งาน
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="live" className="m-0 border-none outline-none">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[32px] p-2 sm:p-6 border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-blue-900/5">
            <RealTimeMonitoring />
          </div>
        </TabsContent>

        <TabsContent value="history" className="m-0 border-none outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                ประวัติการใช้งานระบบ
              </h1>
              <p className="text-slate-500 mt-2">ตรวจสอบบันทึกการเข้าใช้งานระบบ และเหตุการณ์ต่างๆ ย้อนหลัง</p>
            </div>
          </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Legacy System Logs */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
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
        <h3 className="font-bold text-slate-700 mb-6">บันทึกระบบย้อนหลัง</h3>
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 md:ml-6 space-y-8 pb-4">
          {systemLogs.length === 0 ? (
             <div className="pl-8 text-slate-500">ไม่มีบันทึกระบบ</div>
          ) : systemLogs.filter(log => log.action.includes(searchTerm) || log.user.includes(searchTerm)).map((log) => {
            const { icon: Icon, bg, color } = getLogIcon(log.type);
            const timeAgo = format(new Date(log.createdAt), "dd MMM yyyy HH:mm", { locale: th });
            return (
              <div key={log.id} className="relative pl-8 md:pl-12">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 p-2 rounded-full border-4 border-white dark:border-slate-900 ${bg} ${color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Content */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-[15px]">{log.action}</h4>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap self-start">
                      {timeAgo}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityLogs;
