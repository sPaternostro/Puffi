"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { GUIDE_STEPS, WELCOME_REMIND_AFTER_MS, WELCOME_STORAGE_KEY } from "@/lib/guide";

export function WelcomeGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WELCOME_STORAGE_KEY);
      const last = raw ? Number(raw) : 0;
      if (!last || Date.now() - last > WELCOME_REMIND_AFTER_MS) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(WELCOME_STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#4a403a]/35 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary-strong">
          <Sparkles size={20} />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Así se usa Puffi</h2>
        <p className="mt-2 text-sm leading-6 text-foreground/70">
          Un vistazo rápido. Después lo encontrás en Cuenta, si lo necesitás.
        </p>
        <ol className="mt-5 space-y-4">
          {GUIDE_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-medium">{step.title}</span>
                <span className="mt-0.5 block text-sm leading-6 text-foreground/70">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className="btn-primary mt-6 w-full" onClick={dismiss}>
          Entendido
        </button>
      </div>
    </div>
  );
}
