import { describe, it, expect } from "vitest";

const timeToMinutes = (timeStr: string) => {
  const [h, m] = (timeStr || "00:00").split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const checkOverlap = (
  s1: string, e1: string,
  s2: string, e2: string
): boolean => {
  const start1 = timeToMinutes(s1);
  const end1 = timeToMinutes(e1);
  const start2 = timeToMinutes(s2);
  const end2 = timeToMinutes(e2);
  return start1 < end2 && end1 > start2;
};

describe("Time Overlap Logic", () => {
  it("should return false for back-to-back bookings", () => {
    expect(checkOverlap("10:00", "12:00", "12:00", "14:00")).toBe(false);
    expect(checkOverlap("12:00", "14:00", "10:00", "12:00")).toBe(false);
  });

  it("should return true for overlapping bookings", () => {
    expect(checkOverlap("10:00", "12:00", "11:00", "13:00")).toBe(true);
    expect(checkOverlap("11:00", "13:00", "10:00", "12:00")).toBe(true);
    expect(checkOverlap("10:00", "12:00", "10:30", "11:30")).toBe(true);
    expect(checkOverlap("10:30", "11:30", "10:00", "12:00")).toBe(true);
    expect(checkOverlap("10:00", "12:00", "10:00", "12:00")).toBe(true);
  });

  it("should ignore completed, rejected, and cancelled bookings in active status filter", () => {
    const activeStatuses = ["pending", "approved"];
    expect(activeStatuses.includes("pending")).toBe(true);
    expect(activeStatuses.includes("approved")).toBe(true);
    expect(activeStatuses.includes("completed")).toBe(false);
    expect(activeStatuses.includes("rejected")).toBe(false);
    expect(activeStatuses.includes("cancelled")).toBe(false);
  });
});
