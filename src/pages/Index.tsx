import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Room, Booking, Problem, Evaluation } from "@/data/mockData";
import * as ds from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SummaryCards } from "@/components/layout/SummaryCards";
import { BookingControls } from "@/components/layout/BookingControls";
import { BookingScheduler } from "@/components/layout/BookingScheduler";
import { UpcomingBookings } from "@/components/layout/UpcomingBookings";

import { ReportProblemModal } from "@/components/modals/ReportProblemModal";
import { ReportSuccessModal } from "@/components/modals/ReportSuccessModal";

import { LoginModal } from "@/components/modals/LoginModal";
import { RoomDetailModal } from "@/components/modals/RoomDetailModal";
import { BookingConfirmModal } from "@/components/modals/BookingConfirmModal";
import { CancelConfirmModal } from "@/components/modals/CancelConfirmModal";
import { AdminDashboardModal } from "@/components/modals/AdminDashboardModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { UserManagementModal } from "@/components/modals/UserManagementModal";
import { EvaluationModal } from "@/components/modals/EvaluationModal";
import { ViewEvaluationsModal } from "@/components/modals/ViewEvaluationsModal";

const playNotificationSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.log("Audio not supported");
  }
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canApprove, currentUser } = useAuth();

  // Handle staff/admin redirect on mount
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else if (currentUser?.role === 'staff' && !window.location.search.includes("book=true")) {
      navigate('/staff');
    }
  }, [currentUser, navigate]);

  // State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [realTimeHH, setRealTimeHH] = useState(format(new Date(), 'HH:mm'));
  const [realTimeDate, setRealTimeDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // useMemo สำหรับ displayRooms — ไม่คำนวณซ้ำทุก render
  const displayRooms = useMemo(() => {
    return selectedRoomId === 'all' 
      ? rooms 
      : rooms.filter(r => r.location.includes(`ชั้น ${selectedRoomId}`));
  }, [rooms, selectedRoomId]);

  // ===== รวม 2 intervals เป็น interval เดียว (30 วินาที) =====
  // ตรวจสอบทั้ง: หมดเวลาจอง + เตือนก่อนหมดเวลา 2 นาที
  const notifiedEndRef = useRef<Set<string>>(new Set());
  const notifiedReminderRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkBookingTimes = () => {
      const now = new Date();
      const currentTimeStr = format(now, 'HH:mm');
      const todayStr = format(now, 'yyyy-MM-dd');
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

      setRealTimeHH(currentTimeStr);
      setRealTimeDate(todayStr);

      if (!currentUser || bookings.length === 0) return;

      bookings.forEach(b => {
        if (b.status !== 'approved' || b.date !== todayStr) return;

        const [endH, endM] = b.endTime.split(':').map(Number);
        const endTotalMinutes = endH * 60 + endM;
        const minutesRemaining = endTotalMinutes - currentTotalMinutes;

        // เตือนก่อนหมดเวลา 2 นาที
        if (currentUser && b.userId === currentUser.id && minutesRemaining > 0 && minutesRemaining <= 2 && !notifiedReminderRef.current.has(b.id)) {
          notifiedReminderRef.current.add(b.id);
          toast({
            title: "⏰ ใกล้หมดเวลาการจองแล้ว!",
            description: `เวลาจองห้อง ${b.roomName} ของคุณเหลืออีก 2 นาที อย่าลืมตรวจสอบสัมภาระ ปิดไฟ ปิดแอร์ให้เรียบร้อยนะครับ`,
            duration: 15000,
          });
        }

        // แจ้งเตือนหมดเวลาแล้ว
        if (currentTimeStr >= b.endTime && !notifiedEndRef.current.has(b.id)) {
          notifiedEndRef.current.add(b.id);
          playNotificationSound();
          toast({
            title: "⏰ หมดเวลาการใช้งาน",
            description: `ห้อง ${b.roomName} ครบกำหนดการใช้งานตามที่คุณได้ลงเวลาไว้ อย่าลืมปิดแอร์ ปิดไฟ และอุปกรณ์ไฟฟ้าทุกชนิดด้วยนะครับ`,
            duration: 15000,
          });
        }
      });
    };

    checkBookingTimes(); // เรียกทันที
    const interval = setInterval(checkBookingTimes, 30000); // ทุก 30 วินาที (แทน 10 วินาที x 2)
    return () => clearInterval(interval);
  }, [bookings, currentUser, toast]);

  // Filters state for booking confirm
  const [currentFilters, setCurrentFilters] = useState({
    date: new Date(),
    startTime: '09:00',
    endTime: '11:00',
    participants: 4,
  });

  // Modal states
  const [loginOpen, setLoginOpen] = useState(false);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [adminMode, setAdminMode] = useState<'approve' | 'stats' | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [viewEvaluationsOpen, setViewEvaluationsOpen] = useState(false);
  const [reportProblemOpen, setReportProblemOpen] = useState(false);
  const [reportSuccessOpen, setReportSuccessOpen] = useState(false);

  // ===== Data Service — sync data across tabs/components =====
  useEffect(() => {
    // Initial data load
    ds.getRooms().then(data => { setRooms(data); setFilteredRooms(data); });
    ds.getBookings().then(data => setBookings(data));

    // Listen for data changes from dataService (same-tab + cross-tab)
    const unsub = ds.onDataChange((key, data) => {
      if (key === ds.KEYS.rooms) {
        setRooms(data);
        setFilteredRooms(data);
      } else if (key === ds.KEYS.bookings) {
        setBookings(data);
      }
    });

    // Handle book parameter from URL (for staff redirect)
    if (window.location.search.includes("book=true")) {
      setTimeout(() => {
        document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }

    return unsub;
  }, []);

  // Search handler — ลบ setTimeout 1 วินาทีที่ไม่จำเป็นออก
  const handleTimeSlotClick = useCallback((room: Room, time: string) => {
    if (!currentUser) {
      toast({ title: "กรุณาเข้าสู่ระบบ", variant: "destructive" });
      setLoginOpen(true);
      return;
    }
    
    // Parse time + 1 hour as default end time (capped at 16:30)
    const [h, m] = time.split(':').map(Number);
    let endH = h + 1;
    let endM = m;
    if (endH > 16 || (endH === 16 && endM > 30)) {
      endH = 16;
      endM = 30;
    }
    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    
    setCurrentFilters(prev => ({ ...prev, startTime: time, endTime: endTime }));
    setBookingRoom(room);
  }, [currentUser, toast]);

  const handleSearch = useCallback((filters: { date: Date | undefined; startTime: string; endTime: string; participants: number; equipment: string[] }) => {
    setIsSearching(true);
    setCurrentFilters({
      date: filters.date || new Date(),
      startTime: filters.startTime,
      endTime: filters.endTime,
      participants: filters.participants,
    });

    // ===== ทำ search แบบ synchronous ทันที (ลบ setTimeout 1 วินาที) =====
    const searchDate = format(filters.date || new Date(), 'yyyy-MM-dd');
    
    const results = rooms.map(room => {
      const isOccupied = bookings.some(b => {
        if (b.roomId !== room.id) return false;
        if (b.date !== searchDate) return false;
        if (b.status === 'rejected' || b.status === 'cancelled') return false;
        
        // Check if this booking is already expired in real life
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        const [endH, endM] = b.endTime.split(':').map(Number);
        const endTotalMinutes = endH * 60 + endM;
        if (b.date === format(now, 'yyyy-MM-dd') && currentTotalMinutes >= endTotalMinutes) return false;
        
        // Check time overlap
        const sStart = filters.startTime;
        const sEnd = filters.endTime;
        return (
          (sStart >= b.startTime && sStart < b.endTime) ||
          (sEnd > b.startTime && sEnd <= b.endTime) ||
          (sStart <= b.startTime && sEnd >= b.endTime)
        );
      });
      
      return {
        ...room,
        status: isOccupied ? 'occupied' : (room.status === 'occupied' ? 'available' : room.status) as Room['status']
      };
    }).filter(room => {
      if (room.capacity < filters.participants) return false;
      if (filters.equipment.length > 0 && !filters.equipment.every(eq => room.equipment.includes(eq))) return false;
      return true;
    });

    setFilteredRooms(results);
    setIsSearching(false);

    // Scroll to rooms
    requestAnimationFrame(() => {
      document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [rooms, bookings]);

  // Request booking (Checks auth)
  const handleRequestBooking = useCallback((room: Room) => {
    if (!currentUser) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนทำการจองห้องประชุม",
        variant: "destructive",
      });
      setLoginOpen(true);
      return;
    }
    setBookingRoom(room);
  }, [currentUser, toast]);

  // Booking confirm
  const handleBookingConfirm = useCallback((
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
  ) => {
    if (!bookingRoom) return;
    
    const bookingData = {
      roomId: bookingRoom.id,
      roomName: bookingRoom.name,
      date: format(newDate, 'yyyy-MM-dd'),
      startTime: newStartTime,
      endTime: newEndTime,
      topic,
      notes,
      phone,
      department,
      email,
      participantList,
      extraEquipment,
      participants: newParticipants,
      userId: currentUser?.id || 'anonymous',
      userName: bookerName || (currentUser?.role === 'admin' 
        ? currentUser.name 
        : (currentUser?.nickname ? `${currentUser.nickname} (${currentUser.name})` : currentUser?.name || 'ผู้ใช้ทั่วไป')),
    };

    ds.createBooking(bookingData)
      .then(newBooking => {
        setBookings(prev => {
          if (prev.some(b => b.id === newBooking.id)) return prev;
          return [newBooking, ...prev];
        });
        setBookingRoom(null);
        toast({ title: "ส่งคำขอสำเร็จ", description: `${bookingRoom.name} — รออนุมัติ` });
        setTimeout(() => document.getElementById('my-bookings')?.scrollIntoView({ behavior: 'smooth' }), 300);
        
        // หน่วงเวลา 2 วินาที แล้วแสดงหน้าต่างประเมิน
        setTimeout(() => {
          setEvaluationOpen(true);
          toast({
            title: "ช่วยประเมินระบบให้เราหน่อยนะ! ⭐",
            description: "ใช้เวลาแค่แป๊บเดียว เพื่อการปรับปรุงระบบให้ดียิ่งขึ้น",
          });
        }, 2000);
      })
      .catch(err => {
        console.error("Booking error:", err);
        toast({ title: "เกิดข้อผิดพลาด", description: err.message, variant: "destructive" });
      });
  }, [bookingRoom, currentUser, toast]);

  // Cancel booking
  const handleCancelConfirm = useCallback(() => {
    if (!cancelBooking) return;
    
    ds.updateBookingStatus(cancelBooking.id, "cancelled")
      .then(updatedBooking => {
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
        setCancelBooking(null);
        toast({ title: "ยกเลิกการจองแล้ว" });
      })
      .catch(err => {
        console.error("Cancel error:", err);
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถยกเลิกการจองได้", variant: "destructive" });
      });
  }, [cancelBooking, toast]);

  // Admin actions
  const handleAdminApprove = useCallback((id: string) => {
    ds.updateBookingStatus(id, "approved")
      .then(updatedBooking => {
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
        toast({ title: "อนุมัติคำขอแล้ว" });
      })
      .catch(() => toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" }));
  }, [toast]);

  const handleAdminReject = useCallback((id: string) => {
    ds.updateBookingStatus(id, "rejected")
      .then(updatedBooking => {
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
        toast({ title: "ปฏิเสธคำขอแล้ว" });
      })
      .catch(() => toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" }));
  }, [toast]);

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="relative -mt-20 pt-6 pb-10 sm:pb-16 mb-2 sm:mb-4 overflow-hidden shadow-2xl min-h-[auto] md:min-h-[40vh] lg:min-h-[45vh] flex flex-col rounded-b-[30px] sm:rounded-b-[40px] w-full border border-slate-200 dark:border-white/10">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center contrast-[1.15] saturate-[1.3] brightness-[1.05]"
          style={{ backgroundImage: "url('/bg-building.jpg')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950/95 via-blue-950/95 to-slate-900/90" />
        
        <div className="relative z-10 flex flex-col flex-1 h-full">
          <DashboardHeader 
            onLoginClick={() => setLoginOpen(true)} 
            onProfileClick={() => setProfileOpen(true)} 
            onEvaluateClick={() => setEvaluationOpen(true)} 
            onReportClick={() => setReportProblemOpen(true)} 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <div className="flex-1 flex flex-col justify-center w-full mt-4">
            {(() => {
              const selDateStr = format(selectedDate, 'yyyy-MM-dd');
              const isToday = selDateStr === realTimeDate;
              
              const activeBookingsNow = bookings.filter(b => 
                b.status === 'approved' && 
                b.date === selDateStr && 
                displayRooms.some(r => r.id === b.roomId) &&
                (!isToday || (isToday && realTimeHH >= b.startTime && realTimeHH < b.endTime))
              );
              
              const activeCount = activeBookingsNow.length;
              const maintCount = displayRooms.filter(r => r.status === 'maintenance').length;
              const availCount = Math.max(0, displayRooms.length - activeCount - maintCount);

              return (
                <SummaryCards 
                  totalRooms={displayRooms.length}
                  availableRooms={availCount}
                  inUseRooms={activeCount}
                  maintenanceRooms={maintCount}
                />
              );
            })()}
          </div>
        </div>
      </div>

      <div className="mt-2 w-full">
        <BookingControls 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedRoomId={selectedRoomId}
          onRoomSelect={setSelectedRoomId}
          rooms={rooms}
          bookings={bookings}
        />
      </div>

      <BookingScheduler 
        rooms={displayRooms}
        bookings={bookings} 
        selectedDate={selectedDate}
        realTimeHH={realTimeHH}
        realTimeDate={realTimeDate}
        onTimeSlotClick={handleTimeSlotClick} 
      />

      {/* Modals */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      <RoomDetailModal open={!!detailRoom} onOpenChange={(o) => !o && setDetailRoom(null)} room={detailRoom} />
      <BookingConfirmModal
        open={!!bookingRoom}
        onOpenChange={(o) => !o && setBookingRoom(null)}
        room={bookingRoom}
        rawDate={selectedDate}
        date={format(selectedDate, 'd MMM yyyy', { locale: th })}
        startTime={currentFilters.startTime}
        endTime={currentFilters.endTime}
        participants={currentFilters.participants}
        onConfirm={handleBookingConfirm}
      />
      <CancelConfirmModal
        open={!!cancelBooking}
        onOpenChange={(o) => !o && setCancelBooking(null)}
        booking={cancelBooking}
        onConfirm={handleCancelConfirm}
      />
      <AdminDashboardModal
        open={!!adminMode}
        onOpenChange={(o) => !o && setAdminMode(null)}
        mode={adminMode || 'approve'}
        bookings={bookings}
        onApprove={handleAdminApprove}
        onReject={handleAdminReject}
      />
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
      <UserManagementModal open={usersOpen} onOpenChange={setUsersOpen} />
      <EvaluationModal open={evaluationOpen} onOpenChange={setEvaluationOpen} />
      <ViewEvaluationsModal open={viewEvaluationsOpen} onOpenChange={setViewEvaluationsOpen} />
      <ReportProblemModal open={reportProblemOpen} onOpenChange={setReportProblemOpen} onSuccess={() => setReportSuccessOpen(true)} />
      <ReportSuccessModal open={reportSuccessOpen} onOpenChange={setReportSuccessOpen} />
    </DashboardLayout>
  );
};

export default Index;
