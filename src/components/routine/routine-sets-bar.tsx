"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import {
  activateRoutineSetAction,
  deleteRoutineSetAction,
  renameRoutineSetAction,
} from "@/lib/routine/set-actions";
import type { RoutineSetSummary } from "@/lib/routine/types";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { fill, ui } from "@/lib/i18n/ui";
import type { AppLocale, PlanTier } from "@/types/database";

function RoutineSetsBar({
  locale,
  plan,
  sets,
}: {
  locale: AppLocale;
  plan: PlanTier;
  sets: RoutineSetSummary[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const t = ui(locale);
  const serverActive = sets.find((set) => set.isActive);
  const [selectedId, setSelectedId] = useState(serverActive?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(serverActive?.name ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const showPills = plan === "premium" && sets.length > 1;
  const selected = sets.find((set) => set.id === selectedId) ?? serverActive;

  useEffect(() => {
    if (!busy) {
      setSelectedId(serverActive?.id ?? "");
      setDraft(serverActive?.name ?? "");
    }
    if (busy && serverActive?.id === selectedId) {
      setBusy(false);
      setDraft(serverActive.name);
      setRenaming(false);
      setConfirmDelete(false);
    }
  }, [busy, selectedId, serverActive?.id, serverActive?.name]);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setBusy(false), 8000);
    return () => window.clearTimeout(timer);
  }, [busy]);

  async function switchTo(id: string) {
    if (id === selectedId || busy) return;
    setSelectedId(id);
    setBusy(true);
    setRenaming(false);
    setConfirmDelete(false);
    const result = await activateRoutineSetAction(id);
    if (!result.ok) {
      setSelectedId(serverActive?.id ?? "");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  if (sets.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-card p-4">
      <p className="text-xs leading-5 text-foreground/55">{t.routineSetsHint}</p>

      {showPills ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {sets.map((set) => {
            const on = set.id === selectedId;
            return (
              <button
                key={set.id}
                type="button"
                disabled={busy}
                aria-pressed={on}
                onClick={() => void switchTo(set.id)}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-sm transition ${
                  on
                    ? "border-primary-strong bg-accent font-medium shadow-[inset_0_0_0_1px_rgba(90,70,50,0.12)]"
                    : "border-line bg-background text-foreground/65 hover:border-foreground/20"
                }`}
              >
                {on && busy ? <Spinner className="h-3.5 w-3.5 shrink-0" /> : null}
                {on && !busy ? <Check size={14} className="shrink-0" /> : null}
                <span className="truncate">{pillLabel(set, sets, locale)}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {busy ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium">
          <Spinner className="h-4 w-4" />
          {t.switchingRoutine}
        </p>
      ) : selected ? (
        <p className="mt-3 inline-flex rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium tracking-wide text-primary-strong">
          {t.activeOnToday}
          {selected.name ? ` · ${selected.name}` : ""}
        </p>
      ) : null}

      {selected ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary h-9 px-3 text-sm"
            disabled={busy}
            onClick={() => {
              setDraft(selected.name);
              setRenaming((value) => !value);
              setConfirmDelete(false);
            }}
          >
            <Pencil size={14} />
            {t.renameAction}
          </button>
          {showPills ? (
            <button
              type="button"
              className="btn-secondary h-9 px-3 text-sm"
              disabled={busy}
              onClick={() => {
                setConfirmDelete(true);
                setRenaming(false);
              }}
            >
              <Trash2 size={14} />
              {t.deleteRoutine}
            </button>
          ) : null}
        </div>
      ) : null}

      {renaming && selected ? (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            const next = draft.trim();
            if (!next || next === selected.name) {
              setRenaming(false);
              return;
            }
            await renameRoutineSetAction(selected.id, next);
            push({ kind: "success", title: t.routineRenamed });
            setRenaming(false);
            router.refresh();
          }}
        >
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="input-field h-10"
            maxLength={40}
            placeholder={t.routineNamePlaceholder}
          />
          <button type="submit" className="btn-primary h-10 shrink-0 text-sm">
            {t.saveRoutine}
          </button>
        </form>
      ) : null}

      {confirmDelete && selected ? (
        <div className="mt-3 rounded-xl border border-line bg-background px-3 py-3">
          <p className="text-sm leading-6">{fill(t.confirmDeleteRoutine, { name: selected.name })}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-secondary h-9 text-sm" onClick={() => setConfirmDelete(false)}>
              {t.cancel}
            </button>
            <button
              type="button"
              className="btn-primary h-9 text-sm"
              onClick={async () => {
                await deleteRoutineSetAction(selected.id);
                push({ kind: "success", title: t.routineRemoved, detail: selected.name });
                setConfirmDelete(false);
                router.refresh();
              }}
            >
              {t.deleteRoutine}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RoutineSetsBar;

function pillLabel(set: RoutineSetSummary, sets: RoutineSetSummary[], locale: AppLocale) {
  const same = sets.filter((item) => item.name.trim().toLowerCase() === set.name.trim().toLowerCase());
  if (same.length < 2) return set.name;
  const when = new Date(set.createdAt).toLocaleString(locale === "en" ? "en-GB" : "es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${set.name} · ${when}`;
}
