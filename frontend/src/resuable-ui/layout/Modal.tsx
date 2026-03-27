import { ReactNode } from "react";
import { Styling } from "../types/common-types";

interface ModalProps extends Styling {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  blurBackground?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
  blurBackground = false,
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${
          blurBackground
            ? "backdrop-blur-md bg-white/30 "
            : "bg-black bg-opacity-50"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative z-10 w-full ${sizeClasses[size]} mx-4
          animate-modal-enter
          ${className}
        `}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
          {showCloseButton && (
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={onClose}
                className="
                  text-gray-400 hover:text-gray-700
                  w-8 h-8 rounded-full
                  hover:bg-gray-200
                  flex items-center justify-center
                  hover:scale-110 active:scale-100
                  transition-all duration-200
                  text-xl leading-none
                "
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
          )}
          <div className={showCloseButton ? "p-6 pt-2" : "p-6"}>{children}</div>
        </div>
      </div>
    </div>
  );
}
