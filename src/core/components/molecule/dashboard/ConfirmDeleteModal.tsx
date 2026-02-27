"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Delete story",
  description = "Are you sure you want to delete this story? This action cannot be undone.",
}: ConfirmDeleteModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
      return;
    }

    setIsVisible(false);
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isLoading) onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = [
        cancelButtonRef.current,
        deleteButtonRef.current,
      ].filter(Boolean) as HTMLElement[];

      if (focusable.length === 0) return;

      const currentIndex = focusable.indexOf(
        document.activeElement as HTMLElement,
      );
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusable.length - 1
          : currentIndex - 1
        : (currentIndex + 1) % focusable.length;

      event.preventDefault();
      focusable[nextIndex]?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [mounted, onClose, isLoading]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      } bg-black/55`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
      aria-hidden={!isOpen}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        className={`w-full max-w-[360px] rounded-xl bg-black shadow-2xl border border-white/15 p-5 transition-all duration-200 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <h2
            id="delete-modal-title"
            className="text-base font-semibold text-white"
          >
            {title}
          </h2>
        </div>

        <p id="delete-modal-description" className="text-sm text-gray-200 mb-5">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            ref={deleteButtonRef}
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
