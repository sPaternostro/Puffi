"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { persistLocaleAction } from "@/lib/i18n/actions";
import { Spinner } from "@/components/ui/spinner";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

export function LocaleSwitcher({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const [switchingTo, setSwitchingTo] = useState<AppLocale | null>(null);
  const shown = switchingTo ?? locale;
  const t = ui(shown);

  useEffect(() => {
    if (switchingTo && locale === switchingTo) {
      setSwitchingTo(null);
    }
  }, [locale, switchingTo]);

  useEffect(() => {
    if (!switchingTo) return;
    const timer = window.setTimeout(() => setSwitchingTo(null), 8000);
    return () => window.clearTimeout(timer);
  }, [switchingTo]);

  function choose(next: AppLocale) {
    if (next === locale || switchingTo) return;
    setSwitchingTo(next);
    document.cookie = `puffi-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
    void persistLocaleAction(next);
  }

  return (
    <>
      <div className="inline-flex rounded-full border border-line bg-card p-1 text-sm">
        <button
          type="button"
          disabled={Boolean(switchingTo)}
          onClick={() => choose("es")}
          className={`rounded-full px-3 py-1 ${shown === "es" ? "bg-accent font-medium" : "text-foreground/60"}`}
        >
          ES
        </button>
        <button
          type="button"
          disabled={Boolean(switchingTo)}
          onClick={() => choose("en")}
          className={`rounded-full px-3 py-1 ${shown === "en" ? "bg-accent font-medium" : "text-foreground/60"}`}
        >
          EN
        </button>
      </div>
      {switchingTo ? (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#f7f4f0]/80 backdrop-blur-sm">
          <Spinner className="h-6 w-6" />
          <p className="mt-3 text-sm font-medium">{t.changingLanguage}</p>
        </div>
      ) : null}
    </>
  );
}
