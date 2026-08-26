import { LayoutGrid, CheckCircle2, MonitorPlay, Wrench } from "lucide-react";

interface SummaryCardsProps {
  totalRooms: number;
  availableRooms: number;
  inUseRooms: number;
  maintenanceRooms: number;
}

export const SummaryCards = ({ totalRooms, availableRooms, inUseRooms, maintenanceRooms }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-2 w-full max-w-5xl mx-auto px-4">
      {/* Total Rooms */}
      <div className="bg-white dark:bg-[#3a3b3c] p-4 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm border border-transparent dark:border-slate-600/50">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#1877f2]/15 dark:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#65676b] dark:text-[#b0b3b8]">ห้องทั้งหมด</p>
            <p className="text-2xl font-bold text-[#050505] dark:text-[#e4e6eb] leading-none mt-1">{totalRooms}</p>
          </div>
        </div>
      </div>

      {/* Available */}
      <div className="bg-white dark:bg-[#3a3b3c] p-4 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm border border-transparent dark:border-slate-600/50">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#31a24c]/15 dark:bg-[#31a24c]/20 text-[#31a24c] dark:text-[#42b75e] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#65676b] dark:text-[#b0b3b8]">ห้องว่าง</p>
            <p className="text-2xl font-bold text-[#050505] dark:text-[#e4e6eb] leading-none mt-1">{availableRooms}</p>
          </div>
        </div>
      </div>

      {/* In Use */}
      <div className="bg-white dark:bg-[#3a3b3c] p-4 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm border border-transparent dark:border-slate-600/50">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#e41e3f]/15 dark:bg-[#e41e3f]/20 text-[#e41e3f] dark:text-[#f33a58] flex items-center justify-center shrink-0">
            <MonitorPlay className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#65676b] dark:text-[#b0b3b8]">ถูกจองใช้งาน</p>
            <p className="text-2xl font-bold text-[#050505] dark:text-[#e4e6eb] leading-none mt-1">{inUseRooms}</p>
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white dark:bg-[#3a3b3c] p-4 rounded-xl relative overflow-hidden group transition-all duration-300 shadow-sm border border-transparent dark:border-slate-600/50">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#f5a623]/15 dark:bg-[#f5a623]/20 text-[#e59410] dark:text-[#f5a623] flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#65676b] dark:text-[#b0b3b8]">ปิดปรับปรุง</p>
            <p className="text-2xl font-bold text-[#050505] dark:text-[#e4e6eb] leading-none mt-1">{maintenanceRooms}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
