import { useState } from "react";
import { Database, Cloud, HardDrive, Download, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const BackupRestore = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => setIsBackingUp(false), 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            สำรอง & กู้คืนข้อมูล
          </h1>
          <p className="text-slate-500 mt-2">จัดการข้อมูลระบบ สร้างการสำรองข้อมูล และกู้คืนข้อมูลจากจุดก่อนหน้า</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> สถานะระบบ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">ปกติ</div>
            <p className="text-sm text-slate-500 mt-1">สำรองล่าสุด: วันนี้ เวลา 02:00 น.</p>
          </CardContent>
        </Card>

        {/* Cloud Backup */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 flex justify-between items-center">
              <span className="flex items-center gap-2"><Cloud className="w-4 h-4 text-blue-500" /> ซิงค์คลาวด์</span>
              <Switch defaultChecked />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">กำลังทำงาน</div>
            <p className="text-sm text-slate-500 mt-1">ซิงค์ไปยัง AWS S3 ทุกวัน</p>
          </CardContent>
        </Card>

        {/* Local Storage */}
        <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[24px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-500" /> พื้นที่จัดเก็บที่ใช้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">1.2 GB</div>
            <p className="text-sm text-slate-500 mt-1">เก็บไฟล์สำรองภายใน 45 ไฟล์</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-1">สร้างไฟล์สำรอง</h3>
          <p className="text-sm text-slate-500 mb-8">สร้างไฟล์สำรองของฐานข้อมูลปัจจุบันทั้งหมด</p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300">ข้อควรทราบ</h4>
                <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mt-1">
                  การสำรองข้อมูลแบบกำหนดเองอาจใช้เวลาสักครู่ขึ้นอยู่กับขนาดของฐานข้อมูล โปรดอย่าปิดหน้าต่างนี้ขณะที่กำลังสำรองข้อมูล
                </p>
              </div>
            </div>
            
            <Button 
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px]"
              onClick={handleBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> กำลังสร้างไฟล์สำรอง...</>
              ) : (
                <><Download className="w-5 h-5 mr-2" /> เริ่มการสำรองข้อมูลด้วยตนเอง</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-1">ไฟล์สำรองล่าสุด</h3>
          <p className="text-sm text-slate-500 mb-6">รายการไฟล์สำรองที่มีอยู่สำหรับการกู้คืน</p>
          
          <div className="space-y-3">
            {[
              { date: "วันนี้, 02:00 น.", type: "อัตโนมัติ", size: "28.5 MB" },
              { date: "เมื่อวาน, 02:00 น.", type: "อัตโนมัติ", size: "28.4 MB" },
              { date: "15 ต.ค., 14:30 น.", type: "กำหนดเอง", size: "28.1 MB" },
            ].map((backup, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-[15px]">{backup.date}</h4>
                  <p className="text-sm text-slate-500">สำรองแบบ{backup.type} &bull; {backup.size}</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  กู้คืน
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BackupRestore;
