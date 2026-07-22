import { useState } from "react";
import { Settings2, Bell, Shield, Database, Palette, Smartphone, Globe, Cloud, Save, Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeProvider";

const SystemSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    toast({
      title: "บันทึกการตั้งค่าแล้ว",
      description: "ข้อมูลการเปลี่ยนแปลงของคุณถูกอัปเดตเรียบร้อยแล้ว",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
              <Settings2 className="w-6 h-6" />
            </div>
            ตั้งค่าระบบ
          </h1>
          <p className="text-slate-500 mt-2">กำหนดค่าแพลตฟอร์ม ความปลอดภัย และรูปแบบการแสดงผล</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-500/30 h-11 px-6" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> บันทึกการเปลี่ยนแปลง
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Tabs defaultValue="general" className="col-span-1 lg:col-span-4 flex flex-col lg:flex-row gap-8">
          
          {/* Vertical Tabs List */}
          <TabsList className="flex flex-row lg:flex-col justify-start h-auto bg-transparent gap-2 w-full lg:w-64">
            <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:shadow-sm w-full justify-start rounded-xl p-3">
              <Globe className="w-4 h-4 mr-2" /> ทั่วไป
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm w-full justify-start rounded-xl p-3">
              <Palette className="w-4 h-4 mr-2" /> รูปแบบหน้าตา
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm w-full justify-start rounded-xl p-3">
              <Bell className="w-4 h-4 mr-2" /> การแจ้งเตือน
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm w-full justify-start rounded-xl p-3">
              <Shield className="w-4 h-4 mr-2" /> ความปลอดภัย
            </TabsTrigger>
            <TabsTrigger value="backup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm w-full justify-start rounded-xl p-3">
              <Database className="w-4 h-4 mr-2" /> สำรอง & กู้คืน
            </TabsTrigger>
          </TabsList>

          {/* Content Area */}
          <div className="flex-1 w-full">
            
            <TabsContent value="general" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px]">
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">ข้อมูลทั่วไป</h3>
                    <p className="text-sm text-slate-500">อัปเดตชื่อระบบและข้อมูลองค์กร</p>
                  </div>
                  
                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-600">ชื่อองค์กร</Label>
                      <Input defaultValue="ARIT E-ROOMs" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-600">อีเมลติดต่อ</Label>
                      <Input defaultValue="admin@rmu.ac.th" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-600">เบอร์โทรศัพท์</Label>
                      <Input defaultValue="+66 123 4567" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px]">
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">ธีมและรูปแบบการแสดงผล</h3>
                    <p className="text-sm text-slate-500">ปรับแต่งลักษณะหน้าตาของแพลตฟอร์ม</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                    <button 
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <Sun className={`w-8 h-8 mb-3 ${theme === 'light' ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="font-semibold">โหมดสว่าง</span>
                    </button>
                    <button 
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'}`}
                    >
                      <Moon className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="font-semibold">โหมดมืด</span>
                    </button>
                    <button 
                      onClick={() => setTheme("system")}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${theme === 'system' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'}`}
                    >
                      <Monitor className={`w-8 h-8 mb-3 ${theme === 'system' ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="font-semibold">ตามระบบ</span>
                    </button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px]">
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">การตั้งค่าแจ้งเตือน</h3>
                    <p className="text-sm text-slate-500">เลือกช่องทางและเรื่องที่คุณต้องการรับแจ้งเตือน</p>
                  </div>
                  
                  <div className="space-y-6 max-w-xl">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="font-bold">แจ้งเตือนทางอีเมล</Label>
                        <p className="text-sm text-slate-500">รับอัปเดตการจองผ่านอีเมล</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="font-bold">แจ้งเตือนบนอุปกรณ์</Label>
                        <p className="text-sm text-slate-500">รับการแจ้งเตือนพุชบนอุปกรณ์นี้</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="font-bold">ข่าวสารและการอัปเดต</Label>
                        <p className="text-sm text-slate-500">รับข่าวสารฟีเจอร์ใหม่ๆ</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px]">
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">ความปลอดภัย</h3>
                    <p className="text-sm text-slate-500">จัดการรหัสผ่านและการยืนยันตัวตน</p>
                  </div>
                  
                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-600">รหัสผ่านปัจจุบัน</Label>
                      <Input type="password" placeholder="••••••••" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-600">รหัสผ่านใหม่</Label>
                      <Input type="password" placeholder="••••••••" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                    <Button variant="outline" className="mt-2 rounded-xl">อัปเดตรหัสผ่าน</Button>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 max-w-xl">
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
                      <div className="space-y-0.5">
                        <Label className="font-bold text-amber-700 dark:text-amber-500">การยืนยันตัวตนแบบสองขั้นตอน (2FA)</Label>
                        <p className="text-sm text-amber-600/80 dark:text-amber-500/80">เพิ่มชั้นความปลอดภัยอีกระดับ</p>
                      </div>
                      <Button variant="outline" className="bg-white border-amber-200 text-amber-700">เปิดใช้งาน</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="mt-0">
              <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px]">
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">สำรองข้อมูล & กู้คืน</h3>
                    <p className="text-sm text-slate-500">ปกป้องข้อมูลของคุณด้วยการสำรองข้อมูลอัตโนมัติและกำหนดเอง</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                    <Card className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-slate-200 shadow-none">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Cloud className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">สร้างไฟล์สำรอง</h4>
                          <p className="text-xs text-slate-500 mt-1">สำรองข้อมูลระบบทั้งหมดแบบกำหนดเอง</p>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">สำรองข้อมูลเดี๋ยวนี้</Button>
                      </CardContent>
                    </Card>

                    <Card className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-slate-200 shadow-none">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">กู้คืนข้อมูล</h4>
                          <p className="text-xs text-slate-500 mt-1">กู้คืนระบบจากไฟล์สำรองก่อนหน้า</p>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl border-slate-300">กู้คืน</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="max-w-xl pt-6">
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="space-y-0.5">
                        <Label className="font-bold">สำรองข้อมูลอัตโนมัติ</Label>
                        <p className="text-sm text-slate-500">สำรองข้อมูลขึ้นคลาวด์ทุกวันโดยอัตโนมัติ</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemSettings;
