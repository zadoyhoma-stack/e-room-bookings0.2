import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyBookings } from "@/components/sections/MyBookings";
import { useAuth } from "@/contexts/AuthContext";
import { Booking } from "@/data/mockData";
import * as ds from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    ds.getBookings().then(data => setBookings(data));
    
    const unsub = ds.onDataChange((key, data) => {
      if (key === ds.KEYS.bookings) {
        setBookings(data);
      }
    });

    return unsub;
  }, []);

  const handleCancel = (b: Booking) => {
    ds.updateBookingStatus(b.id, "cancelled")
      .then(updatedBooking => {
        setBookings(prev => prev.map(item => item.id === updatedBooking.id ? updatedBooking : item));
        toast({ title: "ยกเลิกการจองแล้ว" });
      })
      .catch(err => {
        console.error("Cancel error:", err);
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถยกเลิกการจองได้", variant: "destructive" });
      });
  };

  const handleAddToCalendar = (b: Booking) => {
    toast({ title: "เพิ่มลงปฏิทิน", description: `เตรียมเพิ่ม ${b.topic || b.roomName} ลงปฏิทิน (ระบบกำลังพัฒนา)` });
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans overflow-x-hidden relative bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-building.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-200/60 dark:bg-slate-900/80 backdrop-blur-md z-0" />
      
      <div className="relative z-10 flex flex-col flex-1">
        <div className="bg-gradient-to-r from-slate-900/90 to-blue-900/90 backdrop-blur-sm shadow-md border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20 mr-4 rounded-xl" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              กลับหน้าหลัก
            </Button>
          </div>
        </div>
        
        <div className="flex-1 py-6 sm:py-10">
          <MyBookings 
            bookings={bookings}
            onCancel={handleCancel}
            onAddToCalendar={handleAddToCalendar}
          />
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
