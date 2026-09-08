"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { generateRoutineAction } from "@/lib/routine/actions";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
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
}: {
  label: string;
  redirectTo?: string;
  locale?: AppLocale;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % PHASES[locale].length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [pending, locale]);

  return (
    <>
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setPhase(0);
          const started = Date.now();
          const result = await generateRoutineAction();
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
