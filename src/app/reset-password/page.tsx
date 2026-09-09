import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getLocale } from "@/lib/i18n/locale";

export default async function ResetPasswordPage() {
  const locale = await getLocale();
  return (
    <div className="flex min-h-dvh w-full max-w-full flex-1 flex-col items-center justify-center overflow-x-clip px-4 py-10 sm:px-6 sm:py-16">
      <ResetPasswordForm locale={locale} />
    </div>
  );
}
