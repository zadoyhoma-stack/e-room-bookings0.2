/**
 * dataService.ts
 * Data Service Layer — ระบบจัดการข้อมูลกลาง
 * 
 * ลำดับการทำงาน:
 * 1. ลอง fetch จาก /api/* (ถ้ามี Express server เปิดอยู่)
 * 2. ถ้าไม่ได้ → ใช้ localStorage + mockData เป็น fallback
 * 3. ทุก mutation เขียนลง localStorage ทันที
 * 4. Broadcast การเปลี่ยนแปลงผ่าน BroadcastChannel + CustomEvent
 */

import { mockRooms, Room, Booking, Problem, Evaluation } from "@/data/mockData";

// ==================== Storage Keys ====================
const KEYS = {
  rooms: "arit_rooms",
  bookings: "arit_bookings",
  problems: "arit_problems",
  evaluations: "arit_evaluations",
  users: "arit_users",
} as const;

// ==================== BroadcastChannel for cross-tab sync ====================
let channel: BroadcastChannel | null = null;
try {
  channel = new BroadcastChannel("arit_data_sync");
} catch {
  // BroadcastChannel not supported — fallback to StorageEvent only
}

// ==================== Helpers ====================

/** Read from localStorage, return parsed data or fallback */
function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return fallback;
}

/** Write to localStorage + dispatch events for same-tab sync */
function writeLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
  // Same-tab event (StorageEvent only fires cross-tab)
  window.dispatchEvent(new CustomEvent("arit_data_changed", { detail: { key, data } }));
  // Cross-tab broadcast
  channel?.postMessage({ key, data });
}

/** Try to fetch from API, return null if failed */
async function tryFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ==================== Initialize Data ====================
/** Initialize localStorage with mockData if empty */
export function initializeData(): void {
  if (!localStorage.getItem(KEYS.rooms)) {
    localStorage.setItem(KEYS.rooms, JSON.stringify(mockRooms));
  }
  if (!localStorage.getItem(KEYS.bookings)) {
    localStorage.setItem(KEYS.bookings, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.problems)) {
    localStorage.setItem(KEYS.problems, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.evaluations)) {
    localStorage.setItem(KEYS.evaluations, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.users)) {
    // Import default users from AuthContext mock
    const defaultUsers = [
      { id: "u1", name: "ผู้ดูแลระบบ", nickname: "แอดมิน", email: "admin@rmu.ac.th", role: "admin", department: "สำนักวิทยบริการฯ" },
      { id: "u2", name: "สมใจ รักงาน", nickname: "ใจ", email: "staff01@rmu.ac.th", role: "staff", department: "สำนักวิทยบริการฯ" },
      { id: "u3", name: "นายมานะ ขยันเรียน", nickname: "มานะ", email: "student01@rmu.ac.th", role: "student", studentId: "6501234567" },
      { id: "u4", name: "นางสาวสุดา ใจดี", nickname: "สุดา", email: "student02@rmu.ac.th", role: "student", studentId: "6501234568" },
      { id: "u5", name: "นักศึกษา ทดสอบ2", nickname: "นักศึกษา2", email: "student2@rmu.ac.th", role: "student", studentId: "2222222222" },
    ];
    localStorage.setItem(KEYS.users, JSON.stringify(defaultUsers));
  }
}

// ==================== READ Operations ====================

export async function getRooms(): Promise<Room[]> {
  const apiData = await tryFetch<Room[]>("/api/rooms");
  if (apiData) {
    writeLocal(KEYS.rooms, apiData);
    return apiData;
  }
  return readLocal<Room[]>(KEYS.rooms, mockRooms);
}

export async function getBookings(): Promise<Booking[]> {
  const apiData = await tryFetch<Booking[]>("/api/bookings");
  if (apiData) {
    writeLocal(KEYS.bookings, apiData);
    return apiData;
  }
  return readLocal<Booking[]>(KEYS.bookings, []);
}

export async function getProblems(): Promise<Problem[]> {
  const apiData = await tryFetch<Problem[]>("/api/problems");
  if (apiData) {
    writeLocal(KEYS.problems, apiData);
    return apiData;
  }
  return readLocal<Problem[]>(KEYS.problems, []);
}

export async function getEvaluations(): Promise<Evaluation[]> {
  const apiData = await tryFetch<Evaluation[]>("/api/evaluations");
  if (apiData) {
    writeLocal(KEYS.evaluations, apiData);
    return apiData;
  }
  return readLocal<Evaluation[]>(KEYS.evaluations, []);
}

export async function getUsers(): Promise<any[]> {
  const apiData = await tryFetch<any[]>("/api/users");
  if (apiData) {
    writeLocal(KEYS.users, apiData);
    return apiData;
  }
  return readLocal<any[]>(KEYS.users, []);
}

// ==================== BOOKING Mutations ====================

export async function createBooking(bookingData: Omit<Booking, "id" | "status">): Promise<Booking> {
  // Try API first
  const apiResult = await tryFetch<Booking>("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  if (apiResult) {
    // Sync to local
    const bookings = readLocal<Booking[]>(KEYS.bookings, []);
    if (!bookings.some(b => b.id === apiResult.id)) {
      bookings.unshift(apiResult);
      writeLocal(KEYS.bookings, bookings);
    }
    return apiResult;
  }

  // Fallback: create locally
  const newBooking: Booking = {
    ...bookingData as any,
    id: `b${Date.now()}`,
    status: "pending",
  };
  const bookings = readLocal<Booking[]>(KEYS.bookings, []);

  // Check for time overlap
  const overlap = bookings.find(b =>
    b.roomId === newBooking.roomId &&
    b.date === newBooking.date &&
    (b.status === "pending" || b.status === "approved") &&
    (
      (newBooking.startTime >= b.startTime && newBooking.startTime < b.endTime) ||
      (newBooking.endTime > b.startTime && newBooking.endTime <= b.endTime) ||
      (newBooking.startTime <= b.startTime && newBooking.endTime >= b.endTime)
    )
  );
  if (overlap) {
    throw new Error("ห้องนี้มีการจองในช่วงเวลาดังกล่าวแล้ว");
  }

  bookings.unshift(newBooking);
  writeLocal(KEYS.bookings, bookings);
  return newBooking;
}

export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  // Try API
  const apiResult = await tryFetch<Booking>(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (apiResult) {
    const bookings = readLocal<Booking[]>(KEYS.bookings, []);
    const updated = bookings.map(b => b.id === id ? { ...b, status: status as any } : b);
    writeLocal(KEYS.bookings, updated);
    return apiResult;
  }

  // Fallback
  const bookings = readLocal<Booking[]>(KEYS.bookings, []);
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) throw new Error("Booking not found");
  bookings[idx] = { ...bookings[idx], status: status as any };
  writeLocal(KEYS.bookings, bookings);
  return bookings[idx];
}

// ==================== ROOM Mutations ====================

export async function updateRoomStatus(id: string, status: "available" | "maintenance"): Promise<Room> {
  const apiResult = await tryFetch<Room>(`/api/rooms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (apiResult) {
    const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
    const updated = rooms.map(r => r.id === id ? { ...r, ...apiResult } : r);
    writeLocal(KEYS.rooms, updated);
    return apiResult;
  }

  // Fallback
  const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
  const idx = rooms.findIndex(r => r.id === id);
  if (idx === -1) throw new Error("Room not found");
  rooms[idx] = { ...rooms[idx], status };
  writeLocal(KEYS.rooms, rooms);
  return rooms[idx];
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
  const apiResult = await tryFetch<Room>(`/api/rooms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (apiResult) {
    const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
    const updated = rooms.map(r => r.id === id ? { ...r, ...apiResult } : r);
    writeLocal(KEYS.rooms, updated);
    return apiResult;
  }

  const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
  const idx = rooms.findIndex(r => r.id === id);
  if (idx === -1) throw new Error("Room not found");
  rooms[idx] = { ...rooms[idx], ...updates };
  writeLocal(KEYS.rooms, rooms);
  return rooms[idx];
}

// ==================== PROBLEM Mutations ====================

export async function createProblem(data: Omit<Problem, "id" | "status" | "reportedAt">): Promise<Problem> {
  const apiResult = await tryFetch<Problem>("/api/problems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (apiResult) {
    const problems = readLocal<Problem[]>(KEYS.problems, []);
    problems.unshift(apiResult);
    writeLocal(KEYS.problems, problems);
    return apiResult;
  }

  const newProblem: Problem = {
    ...data,
    id: `p${Date.now()}`,
    status: "pending",
    reportedAt: new Date().toISOString(),
  };
  const problems = readLocal<Problem[]>(KEYS.problems, []);
  problems.unshift(newProblem);
  writeLocal(KEYS.problems, problems);
  return newProblem;
}

export async function updateProblemStatus(id: string, status: string): Promise<Problem> {
  const apiResult = await tryFetch<Problem>(`/api/problems/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (apiResult) {
    const problems = readLocal<Problem[]>(KEYS.problems, []);
    const updated = problems.map(p => p.id === id ? { ...p, status: status as any } : p);
    writeLocal(KEYS.problems, updated);
    return apiResult;
  }

  const problems = readLocal<Problem[]>(KEYS.problems, []);
  const idx = problems.findIndex(p => p.id === id);
  if (idx === -1) throw new Error("Problem not found");
  problems[idx] = { ...problems[idx], status: status as any };
  writeLocal(KEYS.problems, problems);
  return problems[idx];
}

// ==================== EVALUATION Mutations ====================

export async function createEvaluation(data: { rating: number; feedback: string }): Promise<Evaluation> {
  const apiResult = await tryFetch<Evaluation>("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (apiResult) {
    const evals = readLocal<Evaluation[]>(KEYS.evaluations, []);
    evals.unshift(apiResult);
    writeLocal(KEYS.evaluations, evals);
    return apiResult;
  }

  const newEval: Evaluation = {
    id: `e${Date.now()}`,
    ...data,
    submittedAt: new Date().toISOString(),
  };
  const evals = readLocal<Evaluation[]>(KEYS.evaluations, []);
  evals.unshift(newEval);
  writeLocal(KEYS.evaluations, evals);
  return newEval;
}

// ==================== USER Mutations ====================

export async function updateUserData(id: string, updates: any): Promise<any> {
  const apiResult = await tryFetch<any>(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (apiResult) {
    const users = readLocal<any[]>(KEYS.users, []);
    const updated = users.map(u => u.id === id ? { ...u, ...apiResult } : u);
    writeLocal(KEYS.users, updated);
    return apiResult;
  }

  const users = readLocal<any[]>(KEYS.users, []);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error("User not found");
  users[idx] = { ...users[idx], ...updates };
  writeLocal(KEYS.users, users);
  return users[idx];
}

export async function deleteUser(id: string): Promise<void> {
  await tryFetch(`/api/users/${id}`, { method: "DELETE" });
  const users = readLocal<any[]>(KEYS.users, []);
  const filtered = users.filter(u => u.id !== id);
  writeLocal(KEYS.users, filtered);
}

// ==================== Event Listener Helper ====================

/** Listen for data changes (both same-tab and cross-tab) */
export function onDataChange(callback: (key: string, data: any) => void): () => void {
  // Same-tab listener
  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.key) callback(detail.key, detail.data);
  };

  // Cross-tab listener (StorageEvent)
  const handleStorage = (e: StorageEvent) => {
    if (e.key && Object.values(KEYS).includes(e.key as any) && e.newValue) {
      try {
        callback(e.key, JSON.parse(e.newValue));
      } catch { /* ignore */ }
    }
  };

  // BroadcastChannel listener
  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.key) callback(e.data.key, e.data.data);
  };

  window.addEventListener("arit_data_changed", handleCustom);
  window.addEventListener("storage", handleStorage);
  channel?.addEventListener("message", handleBroadcast);

  return () => {
    window.removeEventListener("arit_data_changed", handleCustom);
    window.removeEventListener("storage", handleStorage);
    channel?.removeEventListener("message", handleBroadcast);
  };
}

// Storage key exports for direct access if needed
export { KEYS };
