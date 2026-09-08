import Link from "next/link";
import { Droplets, Moon, Shield, Sparkles, Sun, Wind } from "lucide-react";
import { getRoutineAction } from "@/lib/routine/actions";
import { GenerateRoutineButton } from "@/components/routine/generate-routine-button";
import { RoutineRefreshBanner } from "@/components/routine/routine-refresh-banner";
import { ingredientLabel } from "@/lib/ingredients";
import { getLocale } from "@/lib/i18n/locale";
import type { RoutineSuggestion } from "@/lib/routine/engine";
import type { AppLocale } from "@/types/database";

export default async function RoutinePage() {
  const { shelfCount, min, needsRefresh, routine } = await getRoutineAction();
  const locale = await getLocale();
  const canGenerate = shelfCount >= min;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Rutina</h1>
          {!routine ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
              Con {min} producto ya alcanza. Tenés {shelfCount}. Con 2 o 3 el AM/PM queda más
              completo; no hace falta llegar a 8.
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
              El orden de mañana y noche, según lo que cargaste.
            </p>
          )}
        </div>
        {canGenerate && !routine ? <GenerateRoutineButton label="Generar rutina" /> : null}
      </div>

      {needsRefresh ? <div className="mt-6"><RoutineRefreshBanner /></div> : null}

      {!canGenerate ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="font-medium">Todavía no hay productos</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            Cargá al menos {min} (el que ya usás o el que querés comprar). Después volvé acá y tocá
            Generar rutina.
          </p>
          <div className="mt-6 flex justify-end">
            <Link href="/productos" className="btn-primary">
              Cargar productos
            </Link>
          </div>
        </div>
      ) : null}

      {canGenerate && !routine ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="font-medium">Listo para armar mañana y noche</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            Ya tenés {shelfCount} producto{shelfCount === 1 ? "" : "s"}. Generá la rutina cuando
            quieras.
          </p>
        </div>
      ) : null}

      {routine ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <RoutineColumn title="Mañana" period="am" steps={routine.am} />
          <RoutineColumn title="Noche" period="pm" steps={routine.pm} />
        </div>
      ) : null}

      {routine?.warnings.length ? (
        <div className="mt-8 space-y-3">
          <h2 className="font-medium">Avisos de compatibilidad</h2>
          {routine.warnings.map((warning) => (
            <div
              key={`${warning.ingredientA}-${warning.ingredientB}`}
              className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6"
            >
              <p className="font-medium">
                {ingredientLabel(warning.ingredientA)} + {ingredientLabel(warning.ingredientB)}
                {warning.severity === "avoid" ? " · mejor no juntos" : " · con cuidado"}
              </p>
              <p className="mt-1 text-foreground/75">{warning.explanation}</p>
              <p className="mt-1 text-xs text-foreground/55">{warning.productNames.join(" · ")}</p>
            </div>
          ))}
        </div>
      ) : null}

      {routine?.suggestions.length ? (
        <div className="mt-8">
          <h2 className="font-medium">Para completar, si querés</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {routine.suggestions.map((item) => (
              <SuggestionCard key={item.id} item={item} locale={locale} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SuggestionCard({ item, locale }: { item: RoutineSuggestion; locale: AppLocale }) {
  const Icon =
    item.id === "sunscreen"
      ? Shield
      : item.id === "cleanser"
        ? Wind
        : item.id === "caution"
          ? Sparkles
          : Droplets;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-strong">
          <Icon size={18} />
        </span>
        <span>
          <span className="block text-sm font-medium">{item.title}</span>
          <span className="mt-1 block text-sm leading-6 text-foreground/70">{item.detail}</span>
        </span>
      </div>
      {item.searchQuery ? (
        <Link
          href={`/productos/agregar?q=${encodeURIComponent(item.searchQuery)}`}
          className="btn-secondary h-10 w-full text-sm"
        >
          {locale === "en" ? `Search ${item.title.toLowerCase()}` : `Buscar ${item.title.toLowerCase()}`}
        </Link>
      ) : null}
    </li>
  );
}

function RoutineColumn({
  title,
  period,
  steps,
}: {
  title: string;
  period: "am" | "pm";
  steps: { productId: string; name: string; brand: string | null }[];
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="flex items-center gap-2 font-medium">
        {period === "am" ? (
          <Sun size={18} className="text-warning" />
        ) : (
          <Moon size={18} className="text-primary-strong" />
        )}
        {title}
      </h2>
      {steps.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Nada para este momento del día.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li key={`${title}-${step.productId}`} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs">
                {index + 1}
              </span>
              <span>
                <span className="font-medium">{step.name}</span>
                {step.brand ? <span className="block text-foreground/55">{step.brand}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
