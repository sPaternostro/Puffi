"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { guideSteps, WELCOME_REMIND_AFTER_MS, WELCOME_STORAGE_KEY } from "@/lib/guide";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

export function WelcomeGuide({ locale }: { locale: AppLocale }) {
  const [open, setOpen] = useState(false);
  const t = ui(locale);

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#4a403a]/35 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-xl">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-8 sm:py-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent text-primary-strong sm:h-11 sm:w-11">
            <Sparkles size={18} />
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight sm:mt-4 sm:text-2xl">{t.welcomeTitle}</h2>
          <p className="mt-2 text-sm leading-5 text-foreground/70 sm:leading-6">{t.welcomeLead}</p>
          <ol className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
            {guideSteps(locale).map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{step.title}</span>
                  <span className="mt-0.5 block text-sm leading-5 text-foreground/70 sm:leading-6">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="shrink-0 border-t border-line px-4 py-3 sm:px-8 sm:py-4">
          <button type="button" className="btn-primary w-full" onClick={dismiss}>
            {t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}
