import { GenerateRoutineButton } from "@/components/routine/generate-routine-button";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

export function RoutineRefreshBanner({ locale }: { locale: AppLocale }) {
  const t = ui(locale);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{t.shelfChanged}</p>
        <p className="mt-1 text-sm leading-5 text-foreground/65">{t.shelfChangedHint}</p>
      </div>
      <GenerateRoutineButton label={t.updateRoutine} redirectTo="/rutina" locale={locale} />
    </div>
  );
}
