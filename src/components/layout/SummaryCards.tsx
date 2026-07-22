import { LayoutGrid, CheckCircle2, MonitorPlay, Wrench } from "lucide-react";

interface SummaryCardsProps {
  totalRooms: number;
  availableRooms: number;
  inUseRooms: number;
  maintenanceRooms: number;
}

export const SummaryCards = ({ totalRooms, availableRooms, inUseRooms, maintenanceRooms }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 w-full max-w-5xl mx-auto px-4">
      {/* Total Rooms */}
      <div className="bg-white/10 backdrop-blur-md border border-white/30 p-5 rounded-3xl relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/20 transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-400/30 rounded-full blur-2xl group-hover:bg-indigo-400/40 transition-all duration-500" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 flex items-center justify-center shrink-0 shadow-inner">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">ห้องทั้งหมด</p>
            <p className="text-3xl font-bold text-white drop-shadow-md">{totalRooms}</p>
          </div>
        </div>
      </div>

      {/* Available */}
      <div className="bg-white/10 backdrop-blur-md border border-white/30 p-5 rounded-3xl relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/20 transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-sky-400/30 rounded-full blur-2xl group-hover:bg-sky-400/40 transition-all duration-500" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/30 border border-sky-400/50 text-sky-200 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">ห้องว่าง</p>
            <p className="text-3xl font-bold text-white drop-shadow-md">{availableRooms}</p>
          </div>
        </div>
      </div>

      {/* In Use */}
      <div className="bg-white/10 backdrop-blur-md border border-white/30 p-5 rounded-3xl relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/20 transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-pink-400/30 rounded-full blur-2xl group-hover:bg-pink-400/40 transition-all duration-500" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/30 border border-pink-400/50 text-pink-200 flex items-center justify-center shrink-0 shadow-inner">
            <MonitorPlay className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">ถูกจองใช้งาน</p>
            <p className="text-3xl font-bold text-white drop-shadow-md">{inUseRooms}</p>
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white/10 backdrop-blur-md border border-white/30 p-5 rounded-3xl relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/20 transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-400/30 rounded-full blur-2xl group-hover:bg-slate-400/40 transition-all duration-500" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-500/30 border border-slate-400/50 text-slate-200 flex items-center justify-center shrink-0 shadow-inner">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">ปิดปรับปรุง</p>
            <p className="text-3xl font-bold text-white drop-shadow-md">{maintenanceRooms}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
