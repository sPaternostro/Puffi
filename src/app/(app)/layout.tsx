import { AppShell } from "@/components/layout/app-shell";
import { getLocale } from "@/lib/i18n/locale";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return <AppShell locale={locale}>{children}</AppShell>;
}
