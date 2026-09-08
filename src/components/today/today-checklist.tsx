"use client";

import { useRef, useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { logKey } from "@/lib/today/keys";
import { toggleTodayStepAction } from "@/lib/today/actions";
import type { TimeOfDay } from "@/types/database";

type Step = { productId: string; name: string; brand: string | null };

export function TodayChecklist({
  am,
  pm,
  initialDone,
}: {
  am: Step[];
  pm: Step[];
  initialDone: Record<string, boolean>;
}) {
  const [done, setDone] = useState(initialDone);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const seq = useRef<Record<string, number>>({});

  const keys = [...am.map((step) => logKey("am", step.productId)), ...pm.map((step) => logKey("pm", step.productId))];
  const checked = keys.filter((key) => done[key]).length;

  async function toggle(timeOfDay: TimeOfDay, productId: string) {
    const key = logKey(timeOfDay, productId);
    const completed = !done[key];
    seq.current[key] = (seq.current[key] ?? 0) + 1;
    const thisSeq = seq.current[key];

    setDone((current) => ({ ...current, [key]: completed }));
    setSaving((current) => ({ ...current, [key]: true }));

    const result = await toggleTodayStepAction({ productId, timeOfDay, completed });
    if (seq.current[key] !== thisSeq) return;

    setSaving((current) => ({ ...current, [key]: false }));
    if (!result.ok) {
      setDone((current) => ({ ...current, [key]: !completed }));
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <p className="text-sm text-foreground/60">
        {checked} de {keys.length} · se reinicia mañana
      </p>
      <ChecklistColumn title="Mañana" timeOfDay="am" steps={am} done={done} saving={saving} onToggle={toggle} />
      <ChecklistColumn title="Noche" timeOfDay="pm" steps={pm} done={done} saving={saving} onToggle={toggle} />
    </div>
  );
}

function ChecklistColumn({
  title,
  timeOfDay,
  steps,
  done,
  saving,
  onToggle,
}: {
  title: string;
  timeOfDay: TimeOfDay;
  steps: Step[];
  done: Record<string, boolean>;
  saving: Record<string, boolean>;
  onToggle: (timeOfDay: TimeOfDay, productId: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="flex items-center gap-2 font-medium">
        {timeOfDay === "am" ? (
          <Sun size={18} className="text-warning" />
        ) : (
          <Moon size={18} className="text-primary-strong" />
        )}
        {title}
      </h2>
      {steps.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Nada para este momento.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {steps.map((step) => {
            const key = logKey(timeOfDay, step.productId);
            const checked = Boolean(done[key]);
            const busy = Boolean(saving[key]);
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onToggle(timeOfDay, step.productId)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      checked ? "border-success bg-success text-white" : "border-line bg-background"
                    }`}
                  >
                    {busy ? <Spinner className="h-3.5 w-3.5" /> : checked ? <Check size={14} /> : null}
                  </span>
                  <span className={checked ? "text-foreground/45 line-through" : ""}>
                    <span className="block text-sm font-medium">{step.name}</span>
                    {step.brand ? (
                      <span className="block text-xs text-foreground/55">{step.brand}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
