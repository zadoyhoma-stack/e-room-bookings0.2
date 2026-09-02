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

const timeToMinutes = (timeStr: string) => {
  const [h, m] = (timeStr || "00:00").split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Unified Time Overlap Check — ใช้ Logic เดียวกันทั้งระบบ (ข้อ 15, 25)
 * new_start < existing_end AND new_end > existing_start
 */
const checkTimeOverlap = (
  bookings: Booking[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Booking | undefined => {
  return bookings.find(b => {
    if (b.roomId !== roomId) return false;
    if (b.date !== date) return false;
    if (b.status !== 'pending' && b.status !== 'approved') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;

    const sStart = timeToMinutes(startTime);
    const sEnd = timeToMinutes(endTime);
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);

    // กฎเวลาทับซ้อน: new_start < existing_end AND new_end > existing_start
    return sStart < bEnd && sEnd > bStart;
  });
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canApprove, currentUser } = useAuth();

  // Double Submit Protection (ข้อ 20)
  const isSubmittingRef = useRef(false);

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

        const endTotalMinutes = timeToMinutes(b.endTime);
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

        const isPastEnd = currentTotalMinutes >= endTotalMinutes;
        const minutesSinceEnd = currentTotalMinutes - endTotalMinutes;

        // แจ้งเตือนหมดเวลาแล้ว (แจ้งเตือนเฉพาะช่วง 5 นาทีหลังจากหมดเวลา เพื่อป้องกันแจ้งซ้ำรัวๆ ตอน refresh)
        if (isPastEnd && minutesSinceEnd <= 5 && !notifiedEndRef.current.has(b.id)) {
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
    const interval = setInterval(checkBookingTimes, 60000); // ทุก 60 วินาที
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

  // ===== Exit Intent / ปิดเว็บ → เด้งแบบประเมินก่อนออกจากเว็บ =====
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // เมื่อเมาส์เลื่อนออกไปทางขอบบน (จะกดกากบาท/ปิดแท็บ/เปลี่ยนแท็บ)
      if (e.clientY <= 0) {
        const hasEvaluated = sessionStorage.getItem('arit_evaluated') === 'true';
        if (!hasEvaluated) {
          setEvaluationOpen(true);
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasEvaluated = sessionStorage.getItem('arit_evaluated') === 'true';
      if (!hasEvaluated) {
        e.preventDefault();
        e.returnValue = 'กรุณาประเมินความพึงพอใจการใช้งานก่อนออกจากเว็บ';
        return e.returnValue;
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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

    // Room maintenance check (ข้อ 10)
    if (room.status === 'maintenance') {
      toast({ title: "ห้องปิดปรับปรุง", description: `${room.name} ไม่สามารถจองได้ในขณะนี้`, variant: "destructive" });
      return;
    }
    
    // Parse time + 1 hour as default end time (capped at 15:30)
    const [h, m] = (time || "00:00").split(':').map(Number);
    let endH = h + 1;
    let endM = m;
    if (endH > 15 || (endH === 15 && endM > 30)) {
      endH = 15;
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
      const overlappingBooking = checkTimeOverlap(
        bookings,
        room.id,
        searchDate,
        filters.startTime,
        filters.endTime
      );
      
      return {
        ...room,
        status: overlappingBooking ? 'occupied' : (room.status === 'occupied' ? 'available' : room.status) as Room['status'],
        occupiedText: overlappingBooking ? `ติดจอง (ถึง ${overlappingBooking.endTime} น.)` : undefined
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
    // Room maintenance check (ข้อ 10)
    if (room.status === 'maintenance') {
      toast({ title: "ห้องปิดปรับปรุง", description: `${room.name} ไม่สามารถจองได้ในขณะนี้`, variant: "destructive" });
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
    
    if (newStartTime >= newEndTime) {
      toast({ title: "เวลาจองไม่ถูกต้อง", description: "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด", variant: "destructive" });
      return;
    }
    
    // Validate overlap using unified function (ข้อ 5, 15, 25)
    const submitDate = format(newDate, 'yyyy-MM-dd');
    const overlapBooking = checkTimeOverlap(
      bookings,
      bookingRoom.id,
      submitDate,
      newStartTime,
      newEndTime
    );

    if (overlapBooking) {
      toast({ title: "ห้องไม่ว่าง", description: "มีการจองในช่วงเวลานี้แล้ว ไม่สามารถจองซ้ำได้ กรุณาเลือกเวลาอื่น", variant: "destructive" });
      return;
    }

    // Double Submit Protection (ข้อ 20)
    if (isSubmittingRef.current) {
      toast({ title: "กำลังดำเนินการ...", description: "กรุณารอสักครู่" });
      return;
    }
    isSubmittingRef.current = true;
    
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

    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'กำลังส่งคำขอจอง...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.default.showLoading();
        }
      });

      ds.createBooking(bookingData)
        .then(newBooking => {
          setBookings(prev => {
            if (prev.some(b => b.id === newBooking.id)) return prev;
            return [newBooking, ...prev];
          });
          setBookingRoom(null);
          
          Swal.default.fire({
            title: 'ส่งคำขอสำเร็จ!',
            text: `${bookingRoom.name} — รออนุมัติ`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            setTimeout(() => document.getElementById('my-bookings')?.scrollIntoView({ behavior: 'smooth' }), 300);
          });
        })
        .catch(err => {
          console.error("Booking error:", err);
          Swal.default.fire({
            title: 'เกิดข้อผิดพลาด',
            text: err.message,
            icon: 'error'
          });
        })
        .finally(() => {
          isSubmittingRef.current = false;  // Reset Double Submit lock
        });
    });
  }, [bookingRoom, currentUser, toast]);

  // Cancel booking
  const handleCancelConfirm = useCallback(() => {
    if (!cancelBooking) return;
    
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'กำลังยกเลิกการจอง...',
        allowOutsideClick: false,
        didOpen: () => Swal.default.showLoading()
      });

      ds.updateBookingStatus(cancelBooking.id, "cancelled")
        .then(updatedBooking => {
          setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
          setCancelBooking(null);
          Swal.default.fire({ title: 'ยกเลิกสำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false });
        })
        .catch(err => {
          console.error("Cancel error:", err);
          Swal.default.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถยกเลิกการจองได้', icon: 'error' });
        });
    });
  }, [cancelBooking]);

  // Admin actions
  const handleAdminApprove = useCallback((id: string) => {
    import('sweetalert2').then(async (Swal) => {
      const result = await Swal.default.fire({
        title: 'ยืนยันการอนุมัติ?',
        text: 'คุณแน่ใจหรือไม่ที่จะอนุมัติคำขอจองห้องนี้?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'ใช่, อนุมัติเลย'
      });
      if (result.isConfirmed) {
        ds.updateBookingStatus(id, "approved")
          .then(updatedBooking => {
            setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
            Swal.default.fire({ title: 'อนุมัติคำขอแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
          })
          .catch((err) => Swal.default.fire({ title: 'เกิดข้อผิดพลาด', text: err.message, icon: 'error' }));
      }
    });
  }, []);

  const handleAdminReject = useCallback((id: string) => {
    import('sweetalert2').then(async (Swal) => {
      const result = await Swal.default.fire({
        title: 'ยืนยันการปฏิเสธ?',
        text: 'คุณแน่ใจหรือไม่ที่จะปฏิเสธคำขอจองห้องนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'ใช่, ปฏิเสธเลย'
      });
      if (result.isConfirmed) {
        ds.updateBookingStatus(id, "rejected")
          .then(updatedBooking => {
            setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
            Swal.default.fire({ title: 'ปฏิเสธคำขอแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
          })
          .catch((err) => Swal.default.fire({ title: 'เกิดข้อผิดพลาด', text: err.message, icon: 'error' }));
      }
    });
  }, []);

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="relative -mt-20 pt-6 pb-6 mb-4 shadow-md flex flex-col w-full z-10 rounded-b-[20px] sm:rounded-b-[30px]">
        {/* Background Image Layer (with overflow-hidden to clip the background but not dropdowns) */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[20px] sm:rounded-b-[30px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: "url('/bg-building.jpg')" }}
          />
          {/* Subtle overlay to keep white text readable but show image clearly */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1877f2]/70 via-[#1877f2]/10 to-transparent dark:from-[#18191a]/90 dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        </div>
        
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
        bookings={bookings}
        currentUser={currentUser}
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
