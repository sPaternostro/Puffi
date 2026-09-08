"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import { Spinner } from "@/components/ui/spinner";
import { LEGAL_SHORT } from "@/lib/legal";
import type { SkinGoal, SkinType } from "@/types/database";

const GOALS: { value: SkinGoal; label: string; hint: string }[] = [
  { value: "acne", label: "Tratar o prevenir acné", hint: "Brotes, puntos negros, textura irregular" },
  { value: "anti_aging", label: "Cuidado anti-edad", hint: "Firmeza, líneas, prevención" },
  { value: "dark_spots", label: "Atenuación de manchas", hint: "Manchas de sol, marcas de acné" },
  { value: "hydration", label: "Más hidratación", hint: "Tirantez, sequedad" },
  { value: "sensitive", label: "Calmar piel sensible", hint: "Rojez, picazón, reactividad" },
];

const TYPES: { value: SkinType; label: string }[] = [
  { value: "dry", label: "Seca" },
  { value: "oily", label: "Grasa" },
  { value: "combination", label: "Mixta" },
  { value: "normal", label: "Normal" },
  { value: "sensitive", label: "Sensible" },
];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<SkinGoal[]>([]);
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [unsureType, setUnsureType] = useState(false);
  const [showTypeGuide, setShowTypeGuide] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [pending, startTransition] = useTransition();

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
        <p className="text-lg font-semibold">Puffi</p>

        {step === 0 ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Primero, tus productos</h1>
            <p className="mt-3 text-sm leading-7 text-foreground/75">
              Cargá lo que <strong>ya tenés en el baño</strong> (o lo que estás por comprar, para ver
              si combina). Puffi ordena mañana y noche y avisa si hay activos que no deberían usarse
              juntos. Con 1 producto ya podés generar una rutina; con 2 o 3 se vuelve más útil. No
              hace falta llegar a 8.
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground/75">
              Más adelante te vamos a sugerir qué te falta según tu objetivo, por ejemplo un sérum.
            </p>
            <label className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                Entiendo que Puffi no reemplaza a un médico. {LEGAL_SHORT}{" "}
                <Link href="/legal" className="underline">
                  Aviso legal
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
                Continuar
              </button>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              ¿Qué te gustaría mejorar o cuidar?
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              Opcional. <strong>Podés marcar más de una.</strong> No es un diagnóstico: es para
              priorizar la rutina.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {GOALS.map((item) => (
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
                Atrás
              </button>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                  Saltar
                </button>
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                  Continuar
                </button>
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">¿Cómo describirías tu piel?</h1>
            <p className="mt-2 text-sm text-foreground/70">
              Opcional. Elegí <strong>una</strong>. Si no estás segura, usá «No sé».
            </p>
            <button
              type="button"
              className="mt-3 text-sm underline"
              onClick={() => setShowTypeGuide((value) => !value)}
            >
              {showTypeGuide ? "Ocultar guía" : "Cómo distinguirlo"}
            </button>
            {showTypeGuide ? (
              <ul className="mt-3 space-y-2 rounded-xl border border-line bg-card p-4 text-sm leading-6 text-foreground/75">
                <li>
                  <strong>Seca:</strong> tira, se ve opaca, a veces descama.
                </li>
                <li>
                  <strong>Grasa:</strong> brillo en casi toda la cara, poros más visibles.
                </li>
                <li>
                  <strong>Mixta:</strong> zona T (frente, nariz, mentón) más grasa; mejillas más normales o
                  secas.
                </li>
                <li>
                  <strong>Normal:</strong> cómoda la mayor parte del día, sin extremos.
                </li>
                <li>
                  <strong>Sensible:</strong> se enrojece o pica fácil con productos nuevos.
                </li>
              </ul>
            ) : null}
            <div className="mt-6 flex flex-col gap-2">
              {TYPES.map((item) => (
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
                No sé
              </button>
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Atrás
              </button>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={finish} disabled={pending}>
                  Saltar
                </button>
                <button type="button" className="btn-primary" onClick={finish} disabled={pending}>
                  {pending ? (
                    <>
                      <Spinner /> Guardando…
                    </>
                  ) : (
                    "Ir a mis productos"
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
