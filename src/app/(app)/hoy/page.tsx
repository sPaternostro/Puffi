import Link from "next/link";
import { getTodayChecklistAction } from "@/lib/today/actions";
import { TodayChecklist } from "@/components/today/today-checklist";
import { RoutineRefreshBanner } from "@/components/routine/routine-refresh-banner";

export default async function TodayPage() {
  const { date, routine, done, needsRefresh } = await getTodayChecklistAction();
  const hasSteps = Boolean(routine && (routine.am.length || routine.pm.length));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hoy</h1>
      {hasSteps ? (
        <p className="mt-2 text-sm text-foreground/70">Tu checklist de {formatDate(date)}.</p>
      ) : (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
          Acá tildás lo que ya usaste. Sale de tu rutina y se reinicia cada día.
        </p>
      )}

      {needsRefresh ? <div className="mt-6"><RoutineRefreshBanner /></div> : null}

      {hasSteps && routine ? (
        <TodayChecklist am={routine.am} pm={routine.pm} initialDone={done} />
      ) : (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="font-medium">Todavía no hay una rutina para tildar</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            Generala en Rutina (con al menos un producto) y este listado se arma solo.
          </p>
          <div className="mt-6 flex justify-end">
            <Link href="/rutina" className="btn-primary">
              Ir a rutina
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
