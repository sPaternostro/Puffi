import Link from "next/link";
import { Droplets, Moon, Shield, Sparkles, Sun, Wind } from "lucide-react";
import { getRoutineAction } from "@/lib/routine/actions";
import { GenerateRoutineButton } from "@/components/routine/generate-routine-button";
import { RoutineRefreshBanner } from "@/components/routine/routine-refresh-banner";
import RoutineSetsBar from "@/components/routine/routine-sets-bar";
import { ingredientLabel } from "@/lib/ingredients";
import { getLocale } from "@/lib/i18n/locale";
import { fill, ui, displayProductName } from "@/lib/i18n/ui";
import type { RoutineSuggestion } from "@/lib/routine/engine";

export default async function RoutinePage() {
  const { shelfCount, min, needsRefresh, routine, sets, plan } = await getRoutineAction();
  const locale = await getLocale();
  const t = ui(locale);
  const canGenerate = shelfCount >= min;
  const isPro = plan === "premium";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.routine}</h1>
          {!routine ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
              {fill(t.routineMinHint, { min, count: shelfCount })}
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">{t.routineOrderHint}</p>
          )}
        </div>
        {canGenerate && !routine ? (
          <GenerateRoutineButton label={t.generateRoutine} locale={locale} />
        ) : null}
        {canGenerate && routine ? (
          <div className="flex flex-wrap gap-2">
            <GenerateRoutineButton label={t.updateRoutine} locale={locale} />
            {isPro ? <GenerateRoutineButton label={t.newRoutine} locale={locale} asNew askName /> : null}
          </div>
        ) : null}
      </div>

      {needsRefresh ? (
        <div className="mt-6">
          <RoutineRefreshBanner locale={locale} />
        </div>
      ) : null}

      {!canGenerate ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="font-medium">{t.noProductsYet}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{fill(t.noProductsHint, { min })}</p>
          <div className="mt-6 flex justify-end">
            <Link href="/productos" className="btn-primary">
              {t.loadProducts}
            </Link>
          </div>
        </div>
      ) : null}

      {canGenerate && !routine ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="font-medium">{t.readyAmPm}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            {fill(t.readyAmPmHint, { count: shelfCount, s: shelfCount === 1 ? "" : "s" })}
          </p>
        </div>
      ) : null}

      {routine ? <RoutineSetsBar locale={locale} plan={plan} sets={sets} /> : null}

      {routine ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <RoutineColumn
            title={t.morning}
            period="am"
            empty={t.nothingForThisTime}
            steps={routine.am}
            locale={locale}
          />
          <RoutineColumn
            title={t.night}
            period="pm"
            empty={t.nothingForThisTime}
            steps={routine.pm}
            locale={locale}
          />
        </div>
      ) : null}

      {routine?.warnings.length ? (
        <div className="mt-8 space-y-3">
          <h2 className="font-medium">{t.compatibility}</h2>
          {routine.warnings.map((warning) => (
            <div
              key={`${warning.ingredientA}-${warning.ingredientB}`}
              className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6"
            >
              <p className="font-medium">
                {ingredientLabel(warning.ingredientA, locale)} + {ingredientLabel(warning.ingredientB, locale)}
                {warning.severity === "avoid" ? ` · ${t.avoidTogether}` : ` · ${t.withCare}`}
              </p>
              <p className="mt-1 text-foreground/75">{warning.explanation}</p>
              <p className="mt-1 text-xs text-foreground/55">{warning.productNames.join(" · ")}</p>
            </div>
          ))}
        </div>
      ) : null}

      {routine?.suggestions.length ? (
        <div className="mt-8">
          <h2 className="font-medium">{t.completeIfYouWant}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {routine.suggestions.map((item) => (
              <SuggestionCard key={item.id} item={item} searchLabel={t.searchFor} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SuggestionCard({
  item,
  searchLabel,
}: {
  item: RoutineSuggestion;
  searchLabel: string;
}) {
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
          {fill(searchLabel, { name: item.title.toLowerCase() })}
        </Link>
      ) : null}
    </li>
  );
}

function RoutineColumn({
  title,
  period,
  empty,
  steps,
  locale,
}: {
  title: string;
  period: "am" | "pm";
  empty: string;
  steps: { productId: string; name: string; brand: string | null }[];
  locale: import("@/types/database").AppLocale;
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
        <p className="mt-3 text-sm text-foreground/60">{empty}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li key={`${title}-${step.productId}`} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs">
                {index + 1}
              </span>
              <span>
                <span className="font-medium">{displayProductName(step.name, locale)}</span>
                {step.brand ? <span className="block text-foreground/55">{step.brand}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
