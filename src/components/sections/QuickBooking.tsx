import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TIME_OPTIONS, PARTICIPANT_OPTIONS, EQUIPMENT_LABELS } from "@/data/mockData";

interface QuickBookingProps {
  onSearch: (filters: {
    date: Date | undefined;
    startTime: string;
    endTime: string;
    participants: number;
    equipment: string[];
  }) => void;
  isLoading: boolean;
}

const equipmentKeys = Object.keys(EQUIPMENT_LABELS).slice(0, 5); // projector, microphone, tv, powerstrip, wifi

export const QuickBooking = ({ onSearch, isLoading }: QuickBookingProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [participants, setParticipants] = useState(4);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const handleSearch = () => {
    onSearch({ date, startTime, endTime, participants, equipment: selectedEquipment });
  };

  return (
    <section id="booking" className="relative py-20 bg-gradient-to-b from-white to-blue-50/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800">ค้นหาห้องว่าง</h2>
          <p className="mt-2 text-slate-500">กรอกรายละเอียดเพื่อค้นหาห้องประชุมที่เหมาะกับคุณ</p>
        </div>

        <GlassCard variant="strong" className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm font-medium">วันที่</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left rounded-xl", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "d MMM yyyy", { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start time */}
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm font-medium">เวลาเริ่ม</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* End time */}
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm font-medium">เวลาสิ้นสุด</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm font-medium">จำนวนผู้เข้าร่วม</Label>
              <Select value={String(participants)} onValueChange={v => setParticipants(Number(v))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{PARTICIPANT_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n} คน</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment */}
          <div className="mt-6">
            <Label className="text-slate-700 text-sm font-medium mb-3 block">อุปกรณ์ที่ต้องการ</Label>
            <div className="flex flex-wrap gap-3">
              {equipmentKeys.map(eq => (
                <label key={eq} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedEquipment.includes(eq)}
                    onCheckedChange={() => toggleEquipment(eq)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-600">{EQUIPMENT_LABELS[eq]}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isLoading}
            size="lg"
            className="mt-6 w-full sm:w-auto rounded-2xl px-10 glow-primary hover-lift"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {isLoading ? 'กำลังค้นหา...' : 'ค้นหาห้องว่าง'}
          </Button>
        </GlassCard>
      </div>
    </section>
  );
};
