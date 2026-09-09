import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getLocale } from "@/lib/i18n/locale";

export default async function OnboardingPage() {
  const locale = await getLocale();
  return <OnboardingFlow locale={locale} />;
}
