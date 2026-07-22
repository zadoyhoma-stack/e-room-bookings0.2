import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/shared/GlassCard";
import { ShieldCheck, BarChart3, Users, Lock, Star } from "lucide-react";

interface AdminTeaserProps {
  pendingCount?: number;
  onApproveClick: () => void;
  onStatsClick: () => void;
  onUsersClick: () => void;
  onViewEvaluationsClick: () => void;
}

export const AdminTeaser = ({ pendingCount = 0, onApproveClick, onStatsClick, onUsersClick, onViewEvaluationsClick }: AdminTeaserProps) => {
  const { canApprove, canViewStats, isAdmin, currentUser } = useAuth();

  // Only show to admin and staff
  if (!canApprove && !canViewStats) return null;

  return (
    <section className="py-20 section-primary relative overflow-hidden">
      {/* Decorative blobs for premium feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-3xl"></div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">สำหรับผู้ดูแลระบบ</h2>
          <p className="mt-2 text-white/70">เครื่องมือจัดการห้องประชุมและคำขอจอง</p>
        </div>

        <div className={`grid grid-cols-1 gap-6 ${isAdmin ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-3 max-w-4xl mx-auto'}`}>
          {/* Approve Bookings */}
          <div className="relative">
            {pendingCount > 0 && (
              <div className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white text-sm font-bold shadow-lg ring-4 ring-slate-900/10 animate-pulse">
                {pendingCount}
              </div>
            )}
            <GlassCard variant="subtle" className="h-full p-8 text-center cursor-pointer hover-lift relative" onClick={onApproveClick}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-inner">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl mb-2">อนุมัติ/ปฏิเสธคำขอ</h3>
              <p className="text-sm text-slate-500">จัดการคำขอจองห้องประชุมจากผู้ใช้งาน</p>
            </GlassCard>
          </div>

          {/* Stats */}
          <GlassCard variant="subtle" className="p-8 text-center cursor-pointer hover-lift" onClick={onStatsClick}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-inner">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-xl mb-2">รายงานสรุป & สถิติ</h3>
            <p className="text-sm text-slate-500">ดูสถิติการใช้ห้องประชุมและรายงานสรุป</p>
          </GlassCard>

          {/* Evaluations - Admin and Staff */}
          <GlassCard
            variant="subtle"
            className="p-8 text-center cursor-pointer hover-lift"
            onClick={onViewEvaluationsClick}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-inner">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-xl mb-2">
              ผลประเมิน
            </h3>
            <p className="text-sm text-slate-500">
              ดูคะแนนความพึงพอใจและข้อเสนอแนะ
            </p>
          </GlassCard>

          {/* Users - ONLY admin can view */}
          {isAdmin && (
            <GlassCard
              variant="subtle"
              className="p-8 text-center cursor-pointer hover-lift"
              onClick={onUsersClick}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 shadow-inner">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl mb-2">
                จัดการผู้ใช้งาน
              </h3>
              <p className="text-sm text-slate-500">
                เพิ่ม แก้ไข ลบบัญชีผู้ใช้งานในระบบ
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </section>
  );
};
