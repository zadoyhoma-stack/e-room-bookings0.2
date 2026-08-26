import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, MapPin, User, Clock, DoorOpen, MonitorPlay, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { format, differenceInMinutes, parse } from "date-fns";
import { th } from "date-fns/locale";
import * as ds from "@/services/dataService";
import { Booking, Room } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const RealTimeMonitoring = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: bookings = [] } = useQuery<Booking[]>({ 
    queryKey: ["admin_bookings"], 
    queryFn: () => ds.getBookings(),
    refetchInterval: 10000 
  });

  const { data: rooms = [] } = useQuery<Room[]>({ 
    queryKey: ["admin_rooms"], 
    queryFn: () => ds.getRooms(),
    refetchInterval: 10000 
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = format(currentTime, "yyyy-MM-dd");
  const currentHH = format(currentTime, "HH:mm");

  const getMinutesSinceMidnight = (timeStr: string) => {
    const [h, m] = (timeStr || "00:00").split(':').map(Number);
    return (h * 60) + m;
  };

  const currentMins = getMinutesSinceMidnight(currentHH);

  const activeBookings = bookings.filter(b => {
    if (b.date !== todayStr || (b.status !== "approved" && b.status !== "completed")) return false; // consider completed if checking history, but we want active now
    if (b.status === "completed") return false;
    const startMins = getMinutesSinceMidnight(b.startTime);
    const endMins = getMinutesSinceMidnight(b.endTime);
    return currentMins >= startMins && currentMins < endMins;
  });

  const getRoomStatus = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.status === "maintenance") return "maintenance";
    const active = activeBookings.find(b => b.roomId === roomId);
    if (active) return "in-use";
    return "available";
  };

  const calculateProgress = (start: string, end: string) => {
    const startM = getMinutesSinceMidnight(start);
    const endM = getMinutesSinceMidnight(end);
    const total = endM - startM;
    const elapsed = currentMins - startM;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const totalCapacityInUse = activeBookings.reduce((sum, b) => sum + (b.participants || 0), 0);
  const maintRooms = rooms.filter(r => r.status === "maintenance").length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <Activity className="w-6 h-6" />
            </div>
            การตรวจสอบสถานะแบบเรียลไทม์
          </h1>
          <p className="text-slate-500 mt-2">ตรวจสอบสถานะการใช้งานห้องประชุม ณ เวลานี้</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-500" />
          <span className="font-mono text-xl font-bold text-slate-800 dark:text-white">{format(currentTime, "HH:mm")}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none p-5 rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">ห้องว่าง</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{rooms.length - activeBookings.length - maintRooms}</p>
          </div>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none p-5 rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <MonitorPlay className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">กำลังใช้งาน</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{activeBookings.length}</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none p-5 rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">คนใช้งานรวม</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{totalCapacityInUse}</p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-0 shadow-lg shadow-slate-200/50 dark:shadow-none p-5 rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">ปิดปรับปรุง</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{maintRooms}</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col: Live Cameras / Room Status */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-pink-500" />
            การใช้งาน ณ ขณะนี้
          </h2>
          
          {activeBookings.length === 0 ? (
             <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 border-dashed rounded-3xl p-12 text-center">
               <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <DoorOpen className="w-8 h-8 text-slate-400" />
               </div>
               <p className="text-lg font-medium text-slate-500">ขณะนี้ไม่มีห้องที่กำลังใช้งาน</p>
             </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {activeBookings.map(b => {
                const progress = calculateProgress(b.startTime, b.endTime);
                return (
                  <Card key={b.id} className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl group bg-white dark:bg-slate-900">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-black text-slate-800 dark:text-white">{b.roomName}</h3>
                          <p className="text-sm text-slate-500 font-medium mt-1">{b.topic || "ไม่ได้ระบุหัวข้อ"}</p>
                        </div>
                        <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-pink-500"></span> กำลังใช้งาน
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                          <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">ผู้ใช้งาน</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{b.userName}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400 px-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {b.startTime}
                          </div>
                          <div className="text-xs text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">{Math.round(progress)}%</div>
                          <div className="flex items-center gap-1.5">
                            {b.endTime}
                            <Clock className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Floor Map Overview */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            ภาพรวมทุกห้อง
          </h2>
          <Card className="p-6 rounded-3xl border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
            <div className="space-y-4">
              {rooms.map(room => {
                const status = getRoomStatus(room.id);
                const statusColors = {
                  "available": "bg-emerald-500 shadow-emerald-500/40",
                  "in-use": "bg-pink-500 shadow-pink-500/40",
                  "maintenance": "bg-slate-400 shadow-slate-400/40"
                };
                return (
                  <div key={room.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full shadow-md", statusColors[status])}></div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{room.name}</p>
                        <p className="text-[11px] text-slate-500">{room.location}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full",
                      status === "available" ? "bg-emerald-100 text-emerald-700" :
                      status === "in-use" ? "bg-pink-100 text-pink-700" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      {status === "available" ? "ว่าง" : status === "in-use" ? "ใช้งานอยู่" : "ปรับปรุง"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
