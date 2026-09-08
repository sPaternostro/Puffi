import { WelcomeGuide } from "@/components/layout/welcome-guide";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SiteHeader } from "@/components/layout/site-header";
import { LegalFooter } from "@/components/legal/legal-footer";
import type { AppLocale } from "@/types/database";

export function AppShell({ children, locale }: { children: React.ReactNode; locale: AppLocale }) {
  return (
    <div className="flex min-h-full flex-col">
      <NavigationProgress />
      <SiteHeader locale={locale} />
      <div className="flex h-12 items-center justify-center border-b border-line bg-card md:hidden">
        <p className="text-base font-semibold tracking-tight">Puffi</p>
      </div>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 sm:px-6 md:py-10 md:pb-10">
        {children}
        <LegalFooter locale={locale} />
      </main>
      <BottomNav locale={locale} />
      <WelcomeGuide />
    </div>
  );
}
