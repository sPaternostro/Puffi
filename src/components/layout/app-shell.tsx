import { WelcomeGuide } from "@/components/layout/welcome-guide";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SiteHeader } from "@/components/layout/site-header";
import { LegalFooter } from "@/components/legal/legal-footer";
import { ProBadge } from "@/components/layout/pro-badge";
import type { AppLocale } from "@/types/database";

export function AppShell({
  children,
  locale,
  isPro,
}: {
  children: React.ReactNode;
  locale: AppLocale;
  isPro: boolean;
}) {
  return (
    <div className="flex min-h-dvh max-w-full flex-col overflow-x-clip">
      <NavigationProgress />
      <SiteHeader locale={locale} isPro={isPro} />
      <div className="flex h-12 items-center justify-center gap-2 border-b border-line bg-card pt-[env(safe-area-inset-top)] md:hidden">
        <p className="text-base font-semibold tracking-tight">Puffi</p>
        {isPro ? <ProBadge /> : null}
      </div>
      <main className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 md:py-10 md:pb-10">
        {children}
        <LegalFooter locale={locale} />
      </main>
      <BottomNav locale={locale} />
      <WelcomeGuide locale={locale} />
    </div>
  );
}
