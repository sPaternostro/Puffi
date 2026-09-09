"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { generateRoutineAction } from "@/lib/routine/actions";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

const PHASES = {
  es: [
    "Mirando lo que tenés…",
    "Ordenando mañana y noche…",
    "Revisando si hay activos que no combinan…",
  ],
  en: ["Looking at what you have…", "Sorting morning and night…", "Checking actives that don’t mix…"],
} as const;

export function GenerateRoutineButton({
  label,
  redirectTo,
  locale = "es",
  asNew = false,
  askName = false,
}: {
  label: string;
  redirectTo?: string;
  locale?: AppLocale;
  asNew?: boolean;
  askName?: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const t = ui(locale);
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState(0);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % PHASES[locale].length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [pending, locale]);

  async function run(routineName?: string) {
    setNaming(false);
    setPending(true);
    setPhase(0);
    const started = Date.now();
    const result = await generateRoutineAction({ name: routineName, asNew });
    const wait = Math.max(0, 1600 - (Date.now() - started));
    await new Promise((resolve) => window.setTimeout(resolve, wait));
    if (!result.ok) {
      setPending(false);
      push({ kind: "error", title: result.error, detail: result.hint });
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
    setPending(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={() => {
          if (askName) {
            setName("");
            setNaming(true);
            return;
          }
          void run();
        }}
      >
        {pending ? (
          <>
            <Spinner /> {locale === "en" ? "Building…" : "Armando…"}
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {label}
          </>
        )}
      </button>
      {naming ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-[#4a403a]/35 p-4">
          <form
            className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl"
            onSubmit={(event) => {
              event.preventDefault();
              const next = name.trim();
              if (!next) return;
              void run(next);
            }}
          >
            <p className="text-sm font-medium">{t.renameRoutine}</p>
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.routineNamePlaceholder}
              className="input-field mt-3"
              maxLength={40}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setNaming(false)}>
                {t.back}
              </button>
              <button type="submit" className="btn-primary" disabled={!name.trim()}>
                {t.saveRoutine}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {pending ? (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#f7f4f0]/88 px-6 backdrop-blur-sm">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="animate-orb absolute inset-0 rounded-full bg-accent" />
            <Sparkles className="animate-spark relative text-primary-strong" size={28} />
          </div>
          <p className="mt-6 text-lg font-medium tracking-tight">
            {locale === "en" ? "Building your routine" : "Armando tu rutina"}
          </p>
          <p className="mt-2 text-sm text-foreground/65">{PHASES[locale][phase]}</p>
        </div>
      ) : null}
    </>
  );
}
