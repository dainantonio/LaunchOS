"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; title: string; message?: string };

const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = String(Date.now()) + Math.random().toString(16).slice(2);
    const toast: Toast = { id, ...t };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div key={t.id} className="rounded-2xl bg-zinc-900/80 px-4 py-3 text-sm shadow-soft ring-1 ring-white/10 backdrop-blur">
            <div className="font-semibold">{t.title}</div>
            {t.message ? <div className="mt-1 text-zinc-300">{t.message}</div> : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}
