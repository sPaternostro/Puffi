"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ui } from "@/lib/i18n/ui";
import { AM_HOUR, PM_HOUR } from "@/lib/push/vapid";
import type { AppLocale } from "@/types/database";

export function RoutineNudge({
  locale,
  hasAm,
  hasPm,
  amDone,
  pmDone,
}: {
  locale: AppLocale;
  hasAm: boolean;
  hasPm: boolean;
  amDone: boolean;
  pmDone: boolean;
}) {
  const t = ui(locale);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hasAm && !amDone && hour >= 6 && hour < 12) {
      setMessage(t.nudgeAm);
      return;
    }
    if (hasPm && !pmDone && hour >= 18) {
      setMessage(t.nudgePm);
      return;
    }
    setMessage(null);
  }, [amDone, hasAm, hasPm, locale, pmDone, t.nudgeAm, t.nudgePm]);

  if (!message) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">{message}</p>
      {typeof window !== "undefined" && window.location.pathname !== "/hoy" ? (
        <Link href="/hoy" className="btn-secondary h-10 text-sm">
          {t.nudgeCta}
        </Link>
      ) : null}
    </div>
  );
}
