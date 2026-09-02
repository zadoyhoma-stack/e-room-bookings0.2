import { useState, useEffect, useMemo } from "react";
import { Room, TIME_OPTIONS, PARTICIPANT_OPTIONS } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Users, MapPin, CheckCircle2, Clock, CalendarDays, Phone, AlignLeft, Send, Mail, User, Building, Laptop, Plus, X, Ban } from "lucide-react";
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

  const validParticipantOptions = PARTICIPANT_OPTIONS.filter(n => n <= (room?.capacity || Infinity));

  useEffect(() => {
    if (open && room) {
      setEditDate(rawDate || new Date());
      setEditStartTime(startTime);
      setEditEndTime(endTime);
      const cappedParticipants = Math.min(participants, room.capacity);
      setEditParticipants(cappedParticipants);
      
      setTopic('');
      setBookerName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
      setPhone(currentUser?.phone || '');
      setDepartment(currentUser?.department || '');
      setExtraEquipment('');
      setParticipantList([]);
      setParticipantInput('');
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
      if (b.status !== 'pending' && b.status !== 'approved') return false;
      
      const sStart = timeToMins(editStartTime);
      const sEnd = timeToMins(editEndTime);
      const bStart = timeToMins(b.startTime);
      const bEnd = timeToMins(b.endTime);
      
      // Standard interval overlap formula: start1 < end2 AND end1 > start2
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

  const handleConfirm = () => {
    onConfirm(
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] border-none shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              จองห้องและบริการ
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 text-sm ml-13 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-semibold text-xs border border-amber-200">นโยบาย: ต้องรอผู้บริหารอนุมัติ (Manager Approval)</span>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-100/50 mb-6 flex gap-4 items-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm border border-blue-100 shrink-0 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[16px] leading-tight">ห้อง: {room.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> รองรับสูงสุด {room.capacity} คน</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {room.location}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> วันที่
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left rounded-xl border-slate-200 h-11 hover:bg-slate-50", !editDate && "text-muted-foreground")}>
                      {editDate ? format(editDate, "d/MM/yyyy") : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                    <Calendar mode="single" selected={editDate} onSelect={(d) => d && setEditDate(d)} initialFocus className="p-3" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" /> เวลาเริ่ม *
                </Label>
                <Select value={editStartTime} onValueChange={setEditStartTime}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 hover:bg-slate-50 font-medium"><SelectValue placeholder="-- เลือกเวลาเริ่ม --" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-60">
                    {START_TIME_OPTIONS.map(t => <SelectItem key={t} value={t} className="cursor-pointer">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" /> เวลาสิ้นสุด *
                </Label>
                <Select value={editEndTime} onValueChange={setEditEndTime}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 hover:bg-slate-50 font-medium"><SelectValue placeholder="-- เลือกเวลาสิ้นสุด --" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-60">
                    {END_TIME_OPTIONS.map(t => <SelectItem key={t} value={t} className="cursor-pointer">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isOverlap && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Ban className="w-4 h-4 shrink-0" />
                ไม่สามารถเลือกเวลานี้ได้ เนื่องจากมีการจองในระบบแล้ว
              </div>
            )}
            {editStartTime >= editEndTime && (
              <div className="bg-amber-50 border border-amber-200 text-amber-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Clock className="w-4 h-4 shrink-0" />
                เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด
              </div>
            )}

            {/* Booker Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                   หัวข้อกิจกรรม <span className="text-red-500">*</span>
                </Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 hover:bg-slate-50"><SelectValue placeholder="เลือกกิจกรรม" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    {ACTIVITY_TOPICS.map(t => <SelectItem key={t} value={t} className="cursor-pointer">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> ชื่อผู้จอง
                </Label>
                <Input value={bookerName} onChange={e => setBookerName(e.target.value)} placeholder="ชื่อ-นามสกุล" className="rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> อีเมล
                </Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="username@rmu.ac.th" type="email" className="rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> เบอร์โทร <span className="text-red-500">*</span>
                </Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0XX-XXX-XXXX" type="tel" className="rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500" />
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" /> หน่วยงาน <span className="text-red-500">*</span>
                </Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 hover:bg-slate-50"><SelectValue placeholder="เลือกหน่วยงาน" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-80">
                    {DEPARTMENTS.map(group => (
                      <SelectGroup key={group.category}>
                        <SelectLabel className="font-bold text-blue-800 bg-blue-50">{group.category}</SelectLabel>
                        {group.items.map(item => (
                          <SelectItem key={item} value={item} className="cursor-pointer pl-6">{item}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Participants */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">รายชื่อผู้เข้าร่วม</Label>
              <div className="flex gap-2">
                <Input 
                  value={participantInput} 
                  onChange={e => setParticipantInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                  placeholder="ระบุ Email หรือ รหัสนักศึกษา" 
                  className="rounded-xl border-slate-200 h-11 focus-visible:ring-blue-500 flex-1" 
                />
                <Button type="button" onClick={handleAddParticipant} className="h-11 rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4">
                  <Plus className="w-4 h-4 mr-2" /> เพิ่ม
                </Button>
              </div>
              {participantList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {participantList.map((p, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      {p}
                      <button onClick={() => handleRemoveParticipant(idx)} className="text-blue-400 hover:text-blue-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1.5 rounded-lg">ℹ️ ผู้เข้าร่วมจะได้รับ QR Code สำหรับ Check-in ทางอีเมล</p>
            </div>

            {/* Equipment */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5 mb-2">อุปกรณ์ที่มีให้ในห้อง</Label>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">WiFi</span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">เครื่องปรับอากาศ</span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">จอทีวี</span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">ไวท์บอร์ด</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" /> ขออุปกรณ์เสริม (ฟรี)
                </Label>
                <Select value={extraEquipment} onValueChange={setExtraEquipment}>
                  <SelectTrigger className="rounded-xl border-slate-200 h-11 hover:bg-slate-50">
                    <SelectValue placeholder="-- เลือกอุปกรณ์ --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="none" className="cursor-pointer text-slate-400 italic">ยังไม่ได้เลือกอุปกรณ์เสริม</SelectItem>
                    {EXTRA_EQUIPMENT_OPTIONS.map(eq => (
                      <SelectItem key={eq} value={eq} className="cursor-pointer">{eq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-12 px-6">ยกเลิก</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isOverlap || editStartTime >= editEndTime || !topic || !phone || !department}
              className={cn(
                "w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                (isOverlap || editStartTime >= editEndTime || !topic || !phone || !department)
                  ? "bg-slate-300 hover:bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 h-12"
              )}
            >
              <Send className="w-4 h-4" />
              จอง
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
