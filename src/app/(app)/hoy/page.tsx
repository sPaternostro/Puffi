import Link from "next/link";
import { getTodayChecklistAction } from "@/lib/today/actions";
import { TodayChecklist } from "@/components/today/today-checklist";
import { RoutineRefreshBanner } from "@/components/routine/routine-refresh-banner";
import { getLocale } from "@/lib/i18n/locale";
import { fill, ui } from "@/lib/i18n/ui";
import { RoutineNudge } from "@/components/pwa/routine-nudge";
import { logKey } from "@/lib/today/keys";
import type { AppLocale } from "@/types/database";

export default async function TodayPage() {
  const { date, routine, done, needsRefresh } = await getTodayChecklistAction();
  const locale = await getLocale();
  const t = ui(locale);
  const hasSteps = Boolean(routine && (routine.am.length || routine.pm.length));
  const amDone =
    (routine?.am.length ?? 0) > 0 && (routine?.am.every((step) => done[logKey("am", step.productId)]) ?? false);
  const pmDone =
    (routine?.pm.length ?? 0) > 0 && (routine?.pm.every((step) => done[logKey("pm", step.productId)]) ?? false);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.today}</h1>
      {hasSteps ? (
        <p className="mt-2 text-sm text-foreground/70">
          {fill(t.todayChecklistOf, { date: formatDate(date, locale), name: routine?.name ?? "" })}
        </p>
      ) : (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">{t.todayIntro}</p>
      )}

      {needsRefresh ? (
        <div className="mt-6">
          <RoutineRefreshBanner locale={locale} />
        </div>
      ) : null}

      {hasSteps ? (
        <RoutineNudge
          locale={locale}
          hasAm={Boolean(routine?.am.length)}
          hasPm={Boolean(routine?.pm.length)}
          amDone={amDone}
          pmDone={pmDone}
        />
      ) : null}

      {hasSteps && routine ? (
        <TodayChecklist am={routine.am} pm={routine.pm} initialDone={done} locale={locale} />
      ) : (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="font-medium">{t.noRoutineToday}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{t.noRoutineTodayHint}</p>
          <div className="mt-6 flex justify-end">
            <Link href="/rutina" className="btn-primary">
              {t.goToRoutine}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(isoDate: string, locale: AppLocale) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
