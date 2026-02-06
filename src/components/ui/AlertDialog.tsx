"use client";

import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  type?: AlertType;
  onButtonClick?: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-green-100",
    icon: "text-green-600",
    button: "bg-green-600 hover:bg-green-700",
  },
  error: {
    bg: "bg-red-100",
    icon: "text-red-600",
    button: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    bg: "bg-yellow-100",
    icon: "text-yellow-600",
    button: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  },
};

export function AlertDialog({
  isOpen,
  onClose,
  title = "Alert",
  message = "",
  buttonText = "Continue",
  type = "info",
  onButtonClick,
}: AlertDialogProps) {
  if (!isOpen) return null;

  const Icon = icons[type];
  const colorScheme = colors[type];

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 ${colorScheme.bg} rounded-full flex items-center justify-center mb-4`}
          >
            <Icon className={`w-8 h-8 ${colorScheme.icon}`} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <button
            onClick={handleButtonClick}
            className={`w-full ${colorScheme.button} text-white px-4 py-2 rounded-full font-medium transition-colors cursor-pointer`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
