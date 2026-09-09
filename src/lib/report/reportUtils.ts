import { format, parseISO, startOfDay, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";

export interface ReportFilterState {
  dateRange: string; // "all" | "today" | "7days" | "thisMonth" | "lastMonth" | "thisYear" | "custom"
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  room: string;       // "all" | room.name
  status: string;     // "all" | "pending" | "approved" | "rejected" | "cancelled" | "completed"
  search: string;
  userName?: string;  // "all" | user.name
}

export interface ReportSummaryStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  popularRoom: { name: string; count: number };
}

export interface RoomStatistic {
  roomId: string;
  roomName: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
}

/**
 * Validate start and end dates
 */
export function validateDateRange(startDate?: string, endDate?: string): { isValid: boolean; errorMessage?: string } {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, errorMessage: "รูปแบบวันที่ไม่ถูกต้อง" };
    }
    if (start > end) {
      return { isValid: false, errorMessage: "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด" };
    }
  }
  return { isValid: true };
}

/**
 * Filter bookings dataset using unified filter state
 */
export function filterReportBookings(bookings: any[], filters: ReportFilterState): any[] {
  // 1. Validate custom dates first
  if (filters.dateRange === "custom") {
    const validation = validateDateRange(filters.startDate, filters.endDate);
    if (!validation.isValid) return [];
  }

  const now = new Date();

  return bookings.filter((b) => {
    // Date filter
    if (b.date) {
      const bDate = new Date(b.date);

      if (filters.dateRange === "custom" && filters.startDate && filters.endDate) {
        const start = startOfDay(new Date(filters.startDate));
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (bDate < start || bDate > end) return false;
      } else if (filters.dateRange === "today") {
        const todayStr = format(now, "yyyy-MM-dd");
        if (b.date !== todayStr) return false;
      } else if (filters.dateRange === "7days") {
        const sevenDaysAgo = subDays(now, 7);
        if (bDate < sevenDaysAgo || bDate > now) return false;
      } else if (filters.dateRange === "thisMonth") {
        const startM = startOfMonth(now);
        if (bDate < startM || bDate > now) return false;
      } else if (filters.dateRange === "lastMonth") {
        const lastM = subMonths(now, 1);
        const startLastM = startOfMonth(lastM);
        const endLastM = endOfMonth(lastM);
        if (bDate < startLastM || bDate > endLastM) return false;
      } else if (filters.dateRange === "thisYear") {
        const startY = startOfYear(now);
        if (bDate < startY || bDate > now) return false;
      }
    }

    // Room filter
    if (filters.room !== "all" && b.roomName !== filters.room && b.roomId !== filters.room) {
      return false;
    }

    // Status filter
    if (filters.status !== "all" && b.status !== filters.status) {
      return false;
    }

    // User filter (specific user dropdown)
    if (filters.userName && filters.userName !== "all" && b.userName !== filters.userName) {
      return false;
    }

    // Search filter
    if (filters.search && filters.search.trim() !== "") {
      const q = filters.search.trim().toLowerCase();
      const searchableFields = [
        b.userName,
        b.email,
        b.department,
        b.topic,
        b.roomName,
        b.phone
      ]
        .filter(Boolean)
        .map((s: string) => String(s).toLowerCase());

      if (!searchableFields.some((field) => field.includes(q))) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate Summary Statistics and Room Breakdown Statistics from filtered bookings
 */
export function calculateReportStats(bookings: any[], rooms: any[] = []) {
  let total = bookings.length;
  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let cancelled = 0;

  const roomMap: Record<string, RoomStatistic> = {};

  // Initialize rooms map from DB rooms
  rooms.forEach((r) => {
    roomMap[r.name || r.id] = {
      roomId: r.id,
      roomName: r.name,
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
    };
  });

  bookings.forEach((b) => {
    const status = (b.status || "").toLowerCase();

    if (status === "approved" || status === "completed") {
      approved++;
    } else if (status === "pending") {
      pending++;
    } else if (status === "rejected") {
      rejected++;
    } else if (status === "cancelled") {
      cancelled++;
    }

    const roomKey = b.roomName || "ไม่ระบุห้อง";
    if (!roomMap[roomKey]) {
      roomMap[roomKey] = {
        roomId: b.roomId || roomKey,
        roomName: roomKey,
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        cancelled: 0,
      };
    }

    roomMap[roomKey].total += 1;
    if (status === "approved" || status === "completed") roomMap[roomKey].approved += 1;
    else if (status === "pending") roomMap[roomKey].pending += 1;
    else if (status === "rejected") roomMap[roomKey].rejected += 1;
    else if (status === "cancelled") roomMap[roomKey].cancelled += 1;
  });

  // Calculate popular room
  let popularRoom = { name: "ยังไม่มีข้อมูล", count: 0 };
  Object.values(roomMap).forEach((rStat) => {
    if (rStat.total > popularRoom.count) {
      popularRoom = { name: rStat.roomName, count: rStat.total };
    }
  });

  const roomStats: RoomStatistic[] = Object.values(roomMap).sort((a, b) => b.total - a.total);

  return {
    summary: {
      total,
      approved,
      pending,
      rejected,
      cancelled,
      popularRoom,
    },
    roomStats,
  };
}

/**
 * Format status string into Thai display text
 */
export function getStatusThaiText(status: string): string {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "รออนุมัติ";
    case "approved":
      return "อนุมัติแล้ว";
    case "rejected":
      return "ปฏิเสธ";
    case "cancelled":
      return "ยกเลิก";
    case "completed":
      return "เสร็จสิ้น";
    default:
      return status || "-";
  }
}
