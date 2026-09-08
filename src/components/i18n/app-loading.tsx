"use client";

import { Spinner } from "@/components/ui/spinner";
import { useClientLocale } from "@/lib/i18n/client-locale";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

export function AppLoading({ locale }: { locale?: AppLocale }) {
  const fromDom = useClientLocale();
  const t = ui(locale ?? fromDom);
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-foreground/70">
      <Spinner />
      {t.loading}
    </div>
  );
}
