import React from "react";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

export type ModalVariant = "default" | "info" | "success" | "warning" | "danger";

interface ModalIconProps {
  variant?: ModalVariant;
  customIcon?: React.ReactNode;
}

export const ModalIcon: React.FC<ModalIconProps> = ({ variant = "default", customIcon }) => {
  if (customIcon) {
    return (
      <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
        {customIcon}
      </div>
    );
  }

  switch (variant) {
    case "success":
      return (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      );
    case "warning":
      return (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
      );
    case "danger":
      return (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
      );
    case "info":
    default:
      return (
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Info className="w-6 h-6" />
        </div>
      );
  }
};
