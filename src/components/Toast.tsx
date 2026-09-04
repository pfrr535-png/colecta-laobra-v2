"use client";

import { useCallback, useRef, useState } from "react";

export interface ToastMessage {
  id: number;
  text: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((text: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return { toasts, showToast };
}

export function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in w-full rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
