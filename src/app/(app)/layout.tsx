import { AppShell } from "@/components/layout/app-shell";
import { getLocale } from "@/lib/i18n/locale";
import { getSessionPlan } from "@/lib/user/plan";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const plan = await getSessionPlan();
  return (
    <AppShell locale={locale} isPro={plan === "premium"}>
      {children}
    </AppShell>
  );
}
