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
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to write to localStorage for key ${key}:`, error);
    // If quota exceeded, we might want to alert the user or clear old data
  }
  // Same-tab event (StorageEvent only fires cross-tab)
  window.dispatchEvent(new CustomEvent("arit_data_changed", { detail: { key, data } }));
  // Cross-tab broadcast
  try {
    channel?.postMessage({ key, data });
  } catch (e) {
    console.warn("BroadcastChannel postMessage failed:", e);
  }
}

/** Write to localStorage quietly without dispatching events (prevents infinite fetch loops during GET queries) */
function writeLocalQuietly<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to write to localStorage for key ${key}:`, error);
  }
}

// ==================== Socket.IO for Cross-Device Sync ====================
let socket: ReturnType<typeof io> | null = null;
try {
  const targetServerUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  if (targetServerUrl) {
    socket = io(targetServerUrl, {
      transports: ['polling'],
      upgrade: false,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 20000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
  }
  
  socket.on('new_booking', (booking: Booking) => {
    const bookings = readLocal<Booking[]>(KEYS.bookings, []);
    if (!bookings.some(b => b.id === booking.id)) {
      bookings.unshift(booking);
      writeLocal(KEYS.bookings, bookings);
    }
  });

  socket.on('update_booking', (updatedBooking: Booking) => {
    const bookings = readLocal<Booking[]>(KEYS.bookings, []);
    const updated = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    writeLocal(KEYS.bookings, updated);
  });

  socket.on('room_updated', (updatedRoom: Room) => {
    const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
    const updated = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    writeLocal(KEYS.rooms, updated);
  });

  socket.on('new_problem', (problem: Problem) => {
    const problems = readLocal<Problem[]>(KEYS.problems, []);
    if (!problems.some(p => p.id === problem.id)) {
      problems.unshift(problem);
      writeLocal(KEYS.problems, problems);
    }
  });

  socket.on('update_problem', (updatedProblem: Problem) => {
    const problems = readLocal<Problem[]>(KEYS.problems, []);
    const updated = problems.map(p => p.id === updatedProblem.id ? updatedProblem : p);
    writeLocal(KEYS.problems, updated);
  });

  socket.on('new_evaluation', (evaluation: Evaluation) => {
    const evals = readLocal<Evaluation[]>(KEYS.evaluations, []);
    if (!evals.some(e => e.id === evaluation.id)) {
      evals.unshift(evaluation);
      writeLocal(KEYS.evaluations, evals);
    }
  });
} catch (e) {
  console.warn("Socket.IO client failed to initialize", e);
}

/** Helper to get Auth Headers */
function getAuthHeaders(headers: any = {}) {
  const token = sessionStorage.getItem('arit_token');
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
}

/** Try to fetch from API, return null if failed */
async function tryFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    // Add cache buster for GET requests to prevent mobile Safari/Chrome aggressive caching
    const isGet = !options?.method || options.method.toUpperCase() === 'GET';
    const finalUrl = isGet ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url;
    
    const finalOptions = {
      ...options,
      headers: getAuthHeaders(options?.headers)
    };

    const res = await fetch(API_BASE_URL + finalUrl, finalOptions);
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
    if (apiData.length === 0) {
      // Backend is empty, seed it with current local data or mockRooms
      const localData = readLocal<Room[]>(KEYS.rooms, mockRooms);
      await tryFetch("/api/rooms/seed", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(localData)
      });
      writeLocalQuietly(KEYS.rooms, localData);
      return localData;
    }
    writeLocalQuietly(KEYS.rooms, apiData);
    return apiData;
  }
  return readLocal<Room[]>(KEYS.rooms, mockRooms);
}

function autoExpireLocalBookings(bookings: Booking[]): Booking[] {
  if (!bookings || bookings.length === 0) return bookings;
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  let changed = false;

  const updated = bookings.map(b => {
    const isPastDate = b.date < currentDate;
    const isTodayPastHour = b.date === currentDate && b.endTime <= currentHour;

    if ((isPastDate && (b.status === 'pending' || b.status === 'approved')) || (isTodayPastHour && b.status === 'approved')) {
      changed = true;
      return { ...b, status: 'completed' as const };
    }
    return b;
  });

  if (changed) {
    writeLocalQuietly(KEYS.bookings, updated);
  }
  return updated;
}

export async function getBookings(): Promise<Booking[]> {
  const apiData = await tryFetch<Booking[]>("/api/bookings");
  if (apiData) {
    const expired = autoExpireLocalBookings(apiData);
    writeLocalQuietly(KEYS.bookings, expired);
    return expired;
  }
  const localData = readLocal<Booking[]>(KEYS.bookings, []);
  return autoExpireLocalBookings(localData);
}

export async function getProblems(): Promise<Problem[]> {
  const apiData = await tryFetch<Problem[]>("/api/problems");
  if (apiData) {
    writeLocalQuietly(KEYS.problems, apiData);
    return apiData;
  }
  return readLocal<Problem[]>(KEYS.problems, []);
}

export async function getEvaluations(): Promise<Evaluation[]> {
  const apiData = await tryFetch<Evaluation[]>("/api/evaluations");
  if (apiData) {
    writeLocalQuietly(KEYS.evaluations, apiData);
    return apiData;
  }
  return readLocal<Evaluation[]>(KEYS.evaluations, []);
}

export async function getUsers(): Promise<any[]> {
  const apiData = await tryFetch<any[]>("/api/users");
  if (apiData) {
    writeLocalQuietly(KEYS.users, apiData);
    return apiData;
  }
  return readLocal<any[]>(KEYS.users, []);
}

// ==================== BOOKING Mutations ====================

export async function createBooking(bookingData: Omit<Booking, "id" | "status">): Promise<Booking> {
  // Always use API — Database is Source of Truth (ข้อ 22)
  const res = await fetch(API_BASE_URL + "/api/bookings", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(bookingData),
  });

  if (res.ok) {
    const apiResult = await res.json();
    const bookings = readLocal<Booking[]>(KEYS.bookings, []);
    if (!bookings.some(b => b.id === apiResult.id)) {
      bookings.unshift(apiResult);
      writeLocal(KEYS.bookings, bookings);
    }
    return apiResult;
  } else {
    const err = await res.json();
    throw new Error(err.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
  }
}

export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  // Always use API — Database is Source of Truth
  const res = await fetch(API_BASE_URL + `/api/bookings/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });

  if (res.ok) {
    const apiResult = await res.json();
    const bookings = readLocal<Booking[]>(KEYS.bookings, []);
    const updated = bookings.map(b => b.id === id ? { ...b, status: status as any } : b);
    writeLocal(KEYS.bookings, updated);
    return apiResult;
  } else {
    const err = await res.json();
    throw new Error(err.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
  }
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

export async function createRoom(roomData: Omit<Room, "id">): Promise<Room> {
  const apiResult = await tryFetch<Room>("/api/rooms", {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(roomData),
  });

  if (apiResult) {
    const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
    writeLocal(KEYS.rooms, [apiResult, ...rooms]);
    return apiResult;
  }

  const rooms = readLocal<Room[]>(KEYS.rooms, mockRooms);
  const newRoom: Room = {
    ...roomData,
    id: `r${Date.now()}`
  } as Room;
  writeLocal(KEYS.rooms, [newRoom, ...rooms]);
  return newRoom;
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
  await tryFetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
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

// ==================== LOGS & REPORTS Operations ====================

export async function getSystemLogs(): Promise<any[]> {
  const apiData = await tryFetch<any[]>("/api/logs");
  if (apiData) return apiData;
  return []; // No fallback for logs
}

export async function getReports(): Promise<any[]> {
  const apiData = await tryFetch<any[]>("/api/reports");
  if (apiData) return apiData;
  return [];
}

export async function createReport(data: { type: string, room: string, format: string }): Promise<any> {
  const apiResult = await tryFetch<any>("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return apiResult;
}

// Storage key exports for direct access if needed
export { KEYS };
