"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { AppLocale } from "@/types/database";

export function LocaleSwitcher({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: AppLocale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex rounded-full border border-line bg-card p-1 text-sm">
      <button
        type="button"
        disabled={pending}
        onClick={() => choose("es")}
        className={`rounded-full px-3 py-1 ${locale === "es" ? "bg-accent font-medium" : "text-foreground/60"}`}
      >
        ES
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => choose("en")}
        className={`rounded-full px-3 py-1 ${locale === "en" ? "bg-accent font-medium" : "text-foreground/60"}`}
      >
        EN
      </button>
    </div>
  );
}
