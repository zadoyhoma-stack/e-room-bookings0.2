import { createSwal } from "./swalTheme";

export const showSuccess = (title: string, text?: string) => {
  return createSwal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "ตกลง",
    iconColor: "#10b981",
  });
};

export const showError = (title: string, text?: string) => {
  return createSwal.fire({
    icon: "error",
    title,
    text: text || "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง",
    confirmButtonText: "เข้าใจแล้ว",
    iconColor: "#ef4444",
  });
};

export const showWarning = (title: string, text?: string) => {
  return createSwal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "เข้าใจแล้ว",
    iconColor: "#f59e0b",
  });
};

export const showInfo = (title: string, text?: string) => {
  return createSwal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "ตกลง",
    iconColor: "#6366f1",
  });
};

export const showConfirm = (
  title: string,
  text: string,
  confirmButtonText: string = "ยืนยัน",
  cancelButtonText: string = "ยกเลิก"
) => {
  return createSwal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    iconColor: "#f59e0b",
  });
};
