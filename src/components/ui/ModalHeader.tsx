import React from "react";
import { X } from "lucide-react";
import { ModalIcon, ModalVariant } from "./ModalIcon";

interface ModalHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: ModalVariant;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  icon,
  variant = "default",
  showCloseButton = true,
  onClose,
}) => {
  return (
    <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="flex items-start gap-3.5 pr-4">
        {(icon || variant) && <ModalIcon variant={variant} customIcon={icon} />}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Modal"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
