"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import { Spinner } from "@/components/ui/spinner";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { legalCopy } from "@/lib/legal";
import { onboardingCopy } from "@/lib/i18n/onboarding";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale, SkinGoal, SkinType } from "@/types/database";

export function OnboardingFlow({ locale }: { locale: AppLocale }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<SkinGoal[]>([]);
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [unsureType, setUnsureType] = useState(false);
  const [showTypeGuide, setShowTypeGuide] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pending, startTransition] = useTransition();
  const t = onboardingCopy(locale);
  const chrome = ui(locale);
  const legal = legalCopy(locale);

  function toggleGoal(value: SkinGoal) {
    setGoals((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function finish() {
    startTransition(async () => {
      await completeOnboardingAction({
        skinGoal: goals[0] ?? null,
        skinType: unsureType ? null : skinType,
      });
    });
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold">Puffi</p>
          <LocaleSwitcher locale={locale} />
        </div>

        {step === 0 ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t.productsTitle}</h1>
            <p className="mt-3 text-sm leading-7 text-foreground/75">{t.productsBody1}</p>
            <p className="mt-3 text-sm leading-7 text-foreground/75">{t.productsBody2}</p>
            <label className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                {t.legalLead} {legal.short}{" "}
                <Link href="/legal" className="underline">
                  {chrome.legal}
                </Link>
              </span>
            </label>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="btn-primary"
                disabled={!accepted}
                onClick={() => setStep(1)}
              >
                {t.continue}
              </button>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t.goalsTitle}</h1>
            <p className="mt-2 text-sm text-foreground/70">{t.goalsHint}</p>
            <div className="mt-6 flex flex-col gap-2">
              {t.goals.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleGoal(item.value)}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    goals.includes(item.value) ? "border-primary-strong bg-accent/60" : "border-line bg-card"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {goals.includes(item.value) ? "✓ " : ""}
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-foreground/60">{item.hint}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <button type="button" className="btn-secondary" onClick={() => setStep(0)}>
                {t.back}
              </button>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                  {t.skip}
                </button>
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                  {t.continue}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t.typesTitle}</h1>
            <p className="mt-2 text-sm text-foreground/70">{t.typesHint}</p>
            <button
              type="button"
              className="mt-3 text-sm underline"
              onClick={() => setShowTypeGuide((value) => !value)}
            >
              {showTypeGuide ? t.hideGuide : t.showGuide}
            </button>
            {showTypeGuide ? (
              <ul className="mt-3 space-y-2 rounded-xl border border-line bg-card p-4 text-sm leading-6 text-foreground/75">
                {t.guide.map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}:</strong> {item.body}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6 flex flex-col gap-2">
              {t.types.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setSkinType(item.value);
                    setUnsureType(false);
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${
                    !unsureType && skinType === item.value
                      ? "border-primary-strong bg-accent/60"
                      : "border-line bg-card"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setUnsureType(true);
                  setSkinType(null);
                }}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  unsureType ? "border-primary-strong bg-accent/60" : "border-line bg-card"
                }`}
              >
                {t.unsure}
              </button>
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                {t.back}
              </button>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={finish} disabled={pending}>
                  {t.skip}
                </button>
                <button type="button" className="btn-primary" onClick={finish} disabled={pending}>
                  {pending ? (
                    <>
                      <Spinner /> {chrome.saving}
                    </>
                  ) : (
                    t.goToProducts
                  )}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
