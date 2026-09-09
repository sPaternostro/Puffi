"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { StatusMessage } from "@/components/ui/status-message";
import { authCopy } from "@/lib/i18n/auth";
import type { AppLocale } from "@/types/database";

function BrandRow({ locale }: { locale: AppLocale }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-lg font-semibold tracking-tight">Puffi</p>
      <LocaleSwitcher locale={locale} />
    </div>
  );
}

export function ResetPasswordForm({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const t = authCopy(locale);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (password !== confirm) {
      setError(t.resetMismatch);
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(t.resetExpired);
      return;
    }
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex w-full max-w-md flex-col rounded-2xl border border-line bg-card p-5 sm:p-10">
        <BrandRow locale={locale} />
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-5 sm:p-10">
        <BrandRow locale={locale} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.resetTitle}</h1>
        <div className="mt-6">
          <StatusMessage kind="error" title={t.resetExpired} />
        </div>
        <Link href="/login" className="btn-primary mt-6 w-full">
          {t.forgotBack}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-card p-5 sm:p-10">
      <BrandRow locale={locale} />
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.resetTitle}</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          {t.password}
          <span className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-field pr-12"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-foreground/45 hover:text-foreground"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t.hidePassword : t.showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          {t.confirmPassword}
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="input-field"
          />
        </label>
        {error ? <StatusMessage kind="error" title={error} /> : null}
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? (
            <>
              <Spinner /> {t.resetSaving}
            </>
          ) : (
            t.resetSubmit
          )}
        </button>
      </form>
    </div>
  );
}
