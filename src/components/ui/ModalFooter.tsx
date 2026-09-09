import React from "react";

interface ModalFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = "" }) => {
  if (!children) return null;

  return (
    <div
      className={`p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 ${className}`}
    >
      {children}
    </div>
  );
};
