import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter as FilterIcon, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReportFilterState, validateDateRange } from "@/lib/report/reportUtils";
import { useToast } from "@/hooks/use-toast";

interface ReportFiltersProps {
  filters: ReportFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilterState>>;
  rooms: { id: string; name: string }[];
  users?: { id: string; name: string; email?: string }[];
  onSearch?: () => void;
  onReset?: () => void;
}

export const ReportFilters = ({
  filters,
  setFilters,
  rooms,
  users = [],
  onSearch,
  onReset,
}: ReportFiltersProps) => {
  const { toast } = useToast();

  const handleApplyFilter = () => {
    if (filters.dateRange === "custom") {
      const validation = validateDateRange(filters.startDate, filters.endDate);
      if (!validation.isValid) {
        toast({
          title: "ข้อมูลตัวกรองไม่ถูกต้อง",
          description: validation.errorMessage || "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด",
          variant: "destructive",
        });
        return;
      }
    }
    if (onSearch) onSearch();
  };

  const handleReset = () => {
    setFilters({
      dateRange: "all",
      startDate: "",
      endDate: "",
      room: "all",
      status: "all",
      userName: "all",
      search: "",
    });
    if (onReset) onReset();
  };

  return (
    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none mb-6">
      <div className="space-y-4">
        {/* Top bar: Filter Header + Reset */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-base">
            <FilterIcon className="w-5 h-5 text-indigo-500" />
            ตัวกรองรายงาน (Report Filters)
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-500 hover:text-rose-600 rounded-xl font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> ล้างตัวกรอง
          </Button>
        </div>

        {/* Quick Date Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs font-bold text-slate-400 mr-1">เลือกช่วงเวลาด่วน:</span>
          {[
            { label: "ทั้งหมด", value: "all" },
            { label: "วันนี้", value: "today" },
            { label: "เดือนนี้", value: "thisMonth" },
            { label: "ปีนี้", value: "thisYear" },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                setFilters((prev) => ({ ...prev, dateRange: preset.value }));
                if (onSearch) onSearch();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filters.dateRange === preset.value
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Main Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Preset / Range Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              ช่วงเวลา
            </label>
            <Select
              value={filters.dateRange}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, dateRange: v }))}
            >
              <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
                <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                <SelectItem value="lastMonth">เดือนที่ผ่านมา</SelectItem>
                <SelectItem value="thisYear">ปีนี้</SelectItem>
                <SelectItem value="custom">กำหนดช่วงวันที่เอง...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              ห้องประชุม
            </label>
            <Select
              value={filters.room}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, room: v }))}
            >
              <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="เลือกห้องประชุม" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">ทุกห้องประชุม</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              สถานะการจอง
            </label>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
            >
              <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รออนุมัติ</SelectItem>
                <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              ผู้จอง
            </label>
            <Select
              value={filters.userName || "all"}
              onValueChange={(v) => setFilters((prev) => ({ ...prev, userName: v }))}
            >
              <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="เลือกผู้จอง" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-56">
                <SelectItem value="all">ผู้จองทั้งหมด</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.name}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Custom Date Inputs */}
        {filters.dateRange === "custom" && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> วันที่เริ่มต้น
              </label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="bg-white dark:bg-slate-900 border-indigo-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> วันที่สิ้นสุด
              </label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="bg-white dark:bg-slate-900 border-indigo-200 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Search input + Search Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อผู้จอง, อีเมล, แผนก/คณะ, วัตถุประสงค์..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl"
            />
          </div>
          <Button
            onClick={handleApplyFilter}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-8 font-bold shadow-md shadow-indigo-500/20"
          >
            <Search className="w-4 h-4 mr-2" /> ค้นหารายงาน
          </Button>
        </div>
      </div>
    </Card>
  );
};
