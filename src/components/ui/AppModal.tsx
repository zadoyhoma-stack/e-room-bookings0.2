import React, { useEffect } from "react";
import { ModalHeader } from "./ModalHeader";
import { ModalFooter } from "./ModalFooter";
import { ModalVariant } from "./ModalIcon";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const AppModal: React.FC<AppModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  variant = "default",
  size = "md",
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  // Prevent Background Scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC Listener
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, onOpenChange]);

  if (!open) return null;

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      case "full":
        return "max-w-6xl";
      case "md":
      default:
        return "max-w-lg";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop / Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => closeOnOverlayClick && onOpenChange(false)}
      />

      {/* Modal Container Card */}
      <div
        className={`relative z-10 w-full ${getSizeClass()} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        {title && (
          <ModalHeader
            title={title}
            description={description}
            icon={icon}
            variant={variant}
            showCloseButton={showCloseButton}
            onClose={() => onOpenChange(false)}
          />
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-700 dark:text-slate-200">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>
  );
};
