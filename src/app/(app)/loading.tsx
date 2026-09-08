import { AppLoading } from "@/components/i18n/app-loading";
import { getLocale } from "@/lib/i18n/locale";

export default async function Loading() {
  const locale = await getLocale();
  return <AppLoading locale={locale} />;
}
