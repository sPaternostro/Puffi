"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { StatusMessage } from "@/components/ui/status-message";
import { authCopy } from "@/lib/i18n/auth";
import { ui } from "@/lib/i18n/ui";
import { getPublicSiteUrl } from "@/lib/site-url";
import type { AppLocale } from "@/types/database";

type Mode = "login" | "signup";

export function AuthForm({ mode, locale }: { mode: Mode; locale: AppLocale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = authCopy(locale);
  const chrome = ui(locale);

  const oauthError = useMemo(
    () => (searchParams.get("error") === "oauth" ? t.oauthFail : null),
    [searchParams, t.oauthFail],
  );

  const labels =
    mode === "login"
      ? {
          title: t.loginTitle,
          submit: t.loginSubmit,
          switchHint: t.loginSwitchHint,
          switchLink: t.loginSwitchLink,
          switchHref: "/signup",
        }
      : {
          title: t.signupTitle,
          submit: t.signupSubmit,
          switchHint: t.signupSwitchHint,
          switchLink: t.signupSwitchLink,
          switchHref: "/login",
        };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(t.badCredentials);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getPublicSiteUrl()}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(t.signupFail);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setInfo(t.confirmEmail);
  }

  async function onGoogle() {
    setError(null);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getPublicSiteUrl()}/auth/callback?next=/`,
      },
    });
    if (oauthError) {
      setError(t.oauthOpenFail);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-card p-5 sm:p-10">
      <p className="text-lg font-semibold tracking-tight">Puffi</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{labels.title}</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/70">{t.tagline}</p>

      <button type="button" onClick={onGoogle} className="btn-secondary mt-8 w-full">
        <GoogleIcon />
        {t.continueGoogle}
      </button>

      <div className="my-6 flex items-center gap-3 text-xs tracking-wide text-foreground/40 uppercase">
        <span className="h-px flex-1 bg-foreground/10" />
        {t.orEmail}
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          {t.email}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-field"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          {t.password}
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-field"
          />
        </label>

        {error || oauthError ? (
          <StatusMessage kind="error" title={error ?? oauthError ?? ""}>
            {oauthError ? t.oauthHint : t.passwordHint}
          </StatusMessage>
        ) : null}
        {info ? (
          <StatusMessage kind="success" title={info}>
            {t.confirmEmailHint}
          </StatusMessage>
        ) : null}

        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? (
            <>
              <Spinner /> {mode === "login" ? t.loggingIn : t.creatingAccount}
            </>
          ) : (
            labels.submit
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground/70">
        {labels.switchHint}{" "}
        <Link href={labels.switchHref} className="font-medium text-foreground underline-offset-4 hover:underline">
          {labels.switchLink}
        </Link>
      </p>
      <p className="mt-4 text-center text-[11px] leading-5 text-foreground/45">
        {t.acceptLegal}{" "}
        <Link href="/legal" className="underline">
          {chrome.legal}
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-4.2 5.5-7.6 6.6l.1.1 6.2 5.2C35.9 41.5 44 36 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}
