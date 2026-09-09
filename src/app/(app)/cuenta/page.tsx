import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { HowToUseCard } from "@/components/layout/how-to-use";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { NotificationSettings } from "@/components/pwa/notification-settings";
import { PlanCards } from "@/components/account/plan-cards";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";
import Link from "next/link";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const { data: profile } = await supabase
    .from("users")
    .select("email, plan, locale, remind_am, remind_pm")
    .eq("id", user.id)
    .maybeSingle();

  const t = ui(locale);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.account}</h1>
      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between gap-4 border-b border-line pb-3">
            <dt className="text-foreground/60">Email</dt>
            <dd className="text-right">{profile?.email ?? user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1">
            <dt className="text-foreground/60">{t.language}</dt>
            <dd>
              <LocaleSwitcher locale={locale} />
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-line pt-4">
          <PlanCards locale={locale} plan={profile?.plan ?? "free"} />
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-sm text-foreground/60">{t.addToHome}</p>
          <div className="mt-2">
            <InstallAppButton locale={locale} />
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-sm text-foreground/60">{t.reminders}</p>
          <div className="mt-2">
            <NotificationSettings
              locale={locale}
              remindAm={profile?.remind_am ?? true}
              remindPm={profile?.remind_pm ?? true}
            />
          </div>
        </div>
        <p className="mt-6 text-xs leading-5 text-foreground/55">
          {locale === "en"
            ? "Puffi does not replace a doctor. Product data comes from public sources and from what you add."
            : "Puffi no reemplaza a un médico. Los datos de productos salen de fuentes públicas y de lo que cargás."}{" "}
          <Link href="/legal" className="underline">
            {t.legal}
          </Link>
        </p>
        <div className="mt-8 flex justify-end">
          <div className="w-full sm:w-auto">
            <SignOutButton locale={locale} />
          </div>
        </div>
      </div>
      <HowToUseCard locale={locale} />
    </div>
  );
}
