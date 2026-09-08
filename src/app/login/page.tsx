import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { getLocale } from "@/lib/i18n/locale";

export default async function LoginPage() {
  const locale = await getLocale();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-4 flex w-full max-w-md justify-end">
        <LocaleSwitcher locale={locale} />
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
