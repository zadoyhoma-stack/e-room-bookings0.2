import { useState, useEffect, useMemo } from "react";
import { Room, PARTICIPANT_OPTIONS } from "@/data/mockData";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Users, MapPin, CheckCircle2, Clock, Phone, Mail, User, Building, Laptop, Plus, X, Ban, Send } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BookingConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  rawDate?: Date;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  onConfirm: (
    topic: string, 
    notes: string, 
    newDate: Date, 
    newStartTime: string, 
    newEndTime: string, 
    newParticipants: number, 
    phone: string,
    bookerName: string,
    email: string,
    department: string,
    participantList: string[],
    extraEquipment: string
  ) => void;
  bookings?: any[];
  currentUser?: any;
}

const DEPARTMENTS = [
  {
    category: 'คณะ (Faculty)',
    items: ['คณะครุศาสตร์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'คณะวิทยาการจัดการ', 'คณะมนุษยศาสตร์และสังคมศาสตร์', 'คณะเทคโนโลยีการเกษตร', 'คณะรัฐศาสตร์และรัฐประศาสนศาสตร์', 'คณะนิติศาสตร์', 'คณะวิศวกรรมศาสตร์', 'คณะพยาบาลศาสตร์', 'บัณฑิตวิทยาลัย']
  },
  {
    category: 'สำนักงานอธิการบดี',
    items: ['สำนักงานอธิการบดี', 'กองกลาง', 'กองคลัง', 'กองนโยบายและแผน', 'กองบริหารงานบุคคล', 'กองพัฒนานักศึกษา', 'ศูนย์สหกิจศึกษาและพัฒนาอาชีพ', 'ศูนย์เทคโนโลยีดิจิทัลและนวัตกรรม']
  },
  {
    category: 'สำนัก / สถาบัน',
    items: ['สำนักวิทยบริการและเทคโนโลยีสารสนเทศ', 'สถาบันวิจัยและพัฒนา']
  },
  {
    category: 'หน่วยงานอื่น',
    items: ['สำนักงานสภามหาวิทยาลัย', 'สภาคณาจารย์และข้าราชการ', 'หน่วยตรวจสอบภายใน', 'งานประชาสัมพันธ์', 'งานประกันคุณภาพการศึกษา', 'งานเลขานุการผู้บริหาร', 'ศูนย์บริการวิชาการ', 'ศูนย์บ่มเพาะวิสาหกิจ', 'ศูนย์ภาษา', 'ศูนย์คอมพิวเตอร์']
  }
];

const ACTIVITY_TOPICS = ['การประชุมภายใน', 'การเรียนการสอน', 'การติวหนังสือ/ทำงานกลุ่ม', 'การจัดกิจกรรมชมรม/คณะ', 'อื่นๆ'];
const EXTRA_EQUIPMENT_OPTIONS = ['ไมโครโฟนเสริม', 'สายเชื่อมต่อ (HDMI/VGA)', 'ปลั๊กพ่วง', 'กระดานฟลิปชาร์ท'];
const START_TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
  '14:00', '14:30', '15:00'
];
const END_TIME_OPTIONS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
  '14:00', '14:30', '15:00', '15:30'
];

export const BookingConfirmModal = ({
  open, onOpenChange, room, rawDate, date, startTime, endTime, participants, onConfirm, bookings = [], currentUser
}: BookingConfirmModalProps) => {
  const [topic, setTopic] = useState('');
  const [bookerName, setBookerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [extraEquipment, setExtraEquipment] = useState('');
  
  const [participantInput, setParticipantInput] = useState('');
  const [participantList, setParticipantList] = useState<string[]>([]);
  
  const [editDate, setEditDate] = useState<Date>(rawDate || new Date());
  const [editStartTime, setEditStartTime] = useState(startTime);
  const [editEndTime, setEditEndTime] = useState(endTime);
  const [editParticipants, setEditParticipants] = useState(participants);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validParticipantOptions = PARTICIPANT_OPTIONS.filter(n => n <= (room?.capacity || Infinity));

  useEffect(() => {
    if (open && room) {
      setEditDate(rawDate || new Date());
      setEditStartTime(startTime);
      setEditEndTime(endTime);
      const cappedParticipants = Math.min(participants, room.capacity);
      setEditParticipants(cappedParticipants);
      
      setTopic('');
      
      let formattedName = currentUser?.name || '';
      if (currentUser) {
        if (currentUser.role === 'student' && currentUser.studentId) {
          formattedName = `${currentUser.name} (${currentUser.studentId})`;
        } else if (currentUser.role === 'staff' && currentUser.department) {
          formattedName = `${currentUser.name} (${currentUser.department})`;
        } else if (currentUser.role === 'admin') {
          formattedName = `${currentUser.name} (ผู้ดูแลระบบ)`;
        }
      }
      setBookerName(formattedName);

      setEmail(currentUser?.email || '');
      setPhone(currentUser?.phone || '');
      setDepartment(currentUser?.department || '');
      setExtraEquipment('');
      setParticipantList([]);
      setParticipantInput('');
      setIsSubmitting(false);
    }
  }, [open, rawDate, startTime, endTime, participants, room, currentUser]);

  const isOverlap = useMemo(() => {
    if (!room || !bookings || bookings.length === 0) return false;
    const submitDate = format(editDate, 'yyyy-MM-dd');
    
    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    
    return bookings.some(b => {
      if (b.roomId !== room.id) return false;
      if (b.date !== submitDate) return false;
      if (b.status === 'cancelled' || b.status === 'rejected') return false;
      
      const sStart = timeToMins(editStartTime);
      const sEnd = timeToMins(editEndTime);
      const bStart = timeToMins(b.startTime);
      const bEnd = timeToMins(b.endTime);
      
      return sStart < bEnd && sEnd > bStart;
    });
  }, [room, bookings, editDate, editStartTime, editEndTime, open]);

  if (!room) return null;

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participantList.includes(participantInput.trim())) {
      setParticipantList([...participantList, participantInput.trim()]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipantList(participantList.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (isSubmitting || isOverlap || editStartTime >= editEndTime || !topic || !phone || !department) return;
    setIsSubmitting(true);
    try {
      await onConfirm(
        topic, 
        '', 
        editDate, 
        editStartTime, 
        editEndTime, 
        editParticipants, 
        phone,
        bookerName,
        email,
        department,
        participantList,
        extraEquipment
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || isOverlap || editStartTime >= editEndTime || !topic || !phone || !department;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      variant="info"
      icon={<CheckCircle2 className="w-6 h-6" />}
      title="จองห้องประชุมและบริการ"
      description="กรุณากรอกข้อมูลและเลือกเวลาการใช้งานห้องประชุมให้ครบถ้วน"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-xl font-bold border-slate-200 text-slate-600 dark:text-slate-300 w-full sm:w-auto"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitDisabled}
            className={cn(
              "rounded-xl font-bold text-white shadow-lg transition-all w-full sm:w-auto px-8 h-11",
              isSubmitDisabled
                ? "bg-slate-300 dark:bg-slate-800 text-slate-500 shadow-none cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            )}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "กำลังส่งคำขอ..." : "ยืนยันการจองห้อง"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Room Spec Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">ห้อง: {room.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500" /> รองรับ {room.capacity} คน</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {room.location}</span>
            </div>
          </div>
        </div>

        {/* Date & Time Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">วันที่ต้องการใช้งาน</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-semibold rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 text-xs">
                  <CalendarIcon className="mr-2 h-4 w-4 text-indigo-600" />
                  {format(editDate, "dd MMMM yyyy", { locale: th })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl" align="start">
                <Calendar
                  mode="single"
                  selected={editDate}
                  onSelect={(d) => d && setEditDate(d)}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="rounded-2xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">เวลาเริ่มต้น</Label>
            <Select value={editStartTime} onValueChange={setEditStartTime}>
              <SelectTrigger className="w-full rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 text-xs font-semibold">
                <SelectValue placeholder="เลือกเวลา" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {START_TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t} น.</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">เวลาสิ้นสุด</Label>
            <Select value={editEndTime} onValueChange={setEditEndTime}>
              <SelectTrigger className="w-full rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 text-xs font-semibold">
                <SelectValue placeholder="เลือกเวลา" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {END_TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t} น.</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Validation Errors */}
        {editStartTime >= editEndTime && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <Ban className="w-4 h-4 shrink-0" /> เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด
          </div>
        )}

        {isOverlap && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <Ban className="w-4 h-4 shrink-0" /> ช่วงเวลาดังกล่าวถูกจองแล้ว กรุณาเลือกช่วงเวลาใหม่
          </div>
        )}

        {/* Form Inputs Grid */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              วัตถุประสงค์การใช้ห้องประชุม <span className="text-rose-500">*</span>
            </Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs">
                <SelectValue placeholder="-- เลือกวัตถุประสงค์ --" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ACTIVITY_TOPICS.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                ชื่อ-นามสกุล ผู้จอง
              </Label>
              <Input
                value={bookerName}
                readOnly
                placeholder="กรอกชื่อ-นามสกุล"
                className="rounded-xl bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 h-11 text-xs cursor-not-allowed text-slate-500 font-semibold"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                คณะ / หน่วยงาน <span className="text-rose-500">*</span>
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs">
                  <SelectValue placeholder="-- เลือกคณะ/หน่วยงาน --" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-56">
                  {DEPARTMENTS.map((group) => (
                    <SelectGroup key={group.category}>
                      <SelectLabel className="font-bold text-indigo-600">{group.category}</SelectLabel>
                      {group.items.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                จำนวนผู้เข้าร่วม (คน)
              </Label>
              <Select
                value={String(editParticipants)}
                onValueChange={(v) => setEditParticipants(Number(v))}
              >
                <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-11 text-xs">
                  <SelectValue placeholder="เลือกจำนวน" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {validParticipantOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} คน</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
