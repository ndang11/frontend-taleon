import { AlertCircle, RefreshCw, XCircle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "error" | "warning" | "info";
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again.",
  onRetry,
  variant = "error",
  className = "",
}: ErrorMessageProps) {
  const variantStyles = {
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-500",
      title: "text-red-900",
      message: "text-red-700",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-500",
      title: "text-yellow-900",
      message: "text-yellow-700",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-500",
      title: "text-blue-900",
      message: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = variantStyles[variant];
  const Icon = variant === "error" ? XCircle : AlertCircle;

  return (
    <div
      className={`rounded-lg border-2 ${styles.container} p-6 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className={`shrink-0 ${styles.icon}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${styles.title}`}>
            {title}
          </h3>
          <p className={`text-sm leading-relaxed ${styles.message}`}>
            {message}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`mt-4 inline-flex items-center gap-2 ${styles.button} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Lightweight loading component
export function LoadingSpinner({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
}
