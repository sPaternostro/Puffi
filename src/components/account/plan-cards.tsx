import { planCopy } from "@/lib/i18n/plans";
import type { AppLocale, PlanTier } from "@/types/database";

export function PlanCards({ locale, plan }: { locale: AppLocale; plan: PlanTier }) {
  const t = planCopy(locale);
  const checkout = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL?.trim();
  const isPro = plan === "premium";

  return (
    <div>
      <p className="text-sm text-foreground/60">{t.title}</p>
      <p className="mt-1 text-xs text-foreground/50">
        {t.current}: {isPro ? t.proName : t.freeName}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className={`rounded-2xl border p-4 ${isPro ? "border-line bg-background" : "border-primary-strong bg-accent/40"}`}>
          <p className="text-sm font-medium">{t.freeName}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{t.freeLead}</p>
          <ul className="mt-3 space-y-1.5 text-sm leading-6 text-foreground/75">
            {t.freeItems.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          {!isPro ? <p className="mt-3 text-xs font-medium text-foreground/55">{t.youHaveThis}</p> : null}
        </article>
        <article className={`rounded-2xl border p-4 ${isPro ? "border-primary-strong bg-accent/40" : "border-line bg-background"}`}>
          <p className="text-sm font-medium">{t.proName}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{t.proLead}</p>
          <ul className="mt-3 space-y-1.5 text-sm leading-6 text-foreground/75">
            {t.proItems.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          {isPro ? (
            <p className="mt-3 text-xs font-medium text-foreground/55">{t.youHaveThis}</p>
          ) : checkout ? (
            <a href={checkout} className="btn-primary mt-4 w-full text-sm">
              {t.upgrade}
            </a>
          ) : (
            <p className="mt-3 text-xs leading-5 text-foreground/55">{t.comingSoon}</p>
          )}
        </article>
      </div>
    </div>
  );
}
