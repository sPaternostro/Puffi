"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getShelfAction, type ShelfProduct } from "@/lib/products/actions";
import { generateRoutine, type GeneratedRoutine } from "@/lib/routine/engine";
import {
  FREE_ROUTINE_SET_LIMIT,
  MIN_PRODUCTS_FOR_ROUTINE,
  PRO_ROUTINE_SET_LIMIT,
} from "@/lib/plans";
import { getLocale } from "@/lib/i18n/locale";
import type { PlanTier, TimeOfDay } from "@/types/database";
import type { RoutineSetSummary } from "@/lib/routine/types";

export type SavedRoutine = GeneratedRoutine & {
  generatedAt: string | null;
  setId: string;
  name: string;
};

export async function getRoutineAction(): Promise<{
  shelfCount: number;
  min: number;
  needsRefresh: boolean;
  plan: PlanTier;
  sets: RoutineSetSummary[];
  routine: SavedRoutine | null;
}> {
  const { user } = await requireUser();
  const shelf = await getShelfAction();
  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("plan, skin_goal").eq("id", user.id).maybeSingle();
  const plan: PlanTier = profile?.plan === "premium" ? "premium" : "free";

  const { data: allSets } = await admin
    .from("routine_sets")
    .select("id, name, is_active, created_at")
    .eq("user_id", user.id)
    .order("created_at");

  const sets: RoutineSetSummary[] = (allSets ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));
  const set = (allSets ?? []).find((row) => row.is_active) ?? null;

  if (!set) {
    return { shelfCount: shelf.length, min: MIN_PRODUCTS_FOR_ROUTINE, needsRefresh: false, plan, sets, routine: null };
  }

  const { data: steps } = await admin
    .from("routines")
    .select("time_of_day, step_order, product_id")
    .eq("routine_set_id", set.id)
    .order("step_order");

  const byId = new Map(shelf.map((item) => [item.productId, item]));
  const am = (steps ?? [])
    .filter((step) => step.time_of_day === "am")
    .map((step) => byId.get(step.product_id))
    .filter((item): item is ShelfProduct => Boolean(item));
  const pm = (steps ?? [])
    .filter((step) => step.time_of_day === "pm")
    .map((step) => byId.get(step.product_id))
    .filter((item): item is ShelfProduct => Boolean(item));

  const locale = await getLocale();
  const { data: conflicts } = await admin
    .from("ingredient_conflicts")
    .select("ingredient_a, ingredient_b, severity, explanation_es, explanation_en");

  const live = generateRoutine(shelf, conflicts ?? [], profile?.skin_goal ?? null, locale);
  const savedAm = (steps ?? []).filter((step) => step.time_of_day === "am").map((step) => step.product_id);
  const savedPm = (steps ?? []).filter((step) => step.time_of_day === "pm").map((step) => step.product_id);
  const needsRefresh =
    !sameIdList(savedAm, live.am.map((item) => item.productId)) ||
    !sameIdList(savedPm, live.pm.map((item) => item.productId));

  const savedAm = (steps ?? []).filter((step) => step.time_of_day === "am").map((step) => step.product_id);
  const savedPm = (steps ?? []).filter((step) => step.time_of_day === "pm").map((step) => step.product_id);
  const liveAm = live.am.map((item) => item.productId);
  const livePm = live.pm.map((item) => item.productId);
  const needsRefresh = !sameIdList(savedAm, liveAm) || !sameIdList(savedPm, livePm);

  return {
    shelfCount: shelf.length,
    min: MIN_PRODUCTS_FOR_ROUTINE,
    needsRefresh,
    plan,
    sets,
    routine: {
      am,
      pm,
      warnings: live.warnings,
      suggestions: live.suggestions,
      generatedAt: set.created_at,
      setId: set.id,
      name: set.name,
    },
  };
}

export async function generateRoutineAction(input?: {
  name?: string;
  asNew?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string; hint?: string }> {
  const { user } = await requireUser();
  const shelf = await getShelfAction();
  if (shelf.length < MIN_PRODUCTS_FOR_ROUTINE) {
    return {
      ok: false,
      error: `Cargá al menos ${MIN_PRODUCTS_FOR_ROUTINE} producto para generar la rutina.`,
      hint: "Con 1 ya alcanza. 2 o 3 dan un AM/PM más útil.",
    };
  }

  const admin = createAdminClient();
  const locale = await getLocale();
  const { data: profile } = await admin
    .from("users")
    .select("skin_goal, plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan: PlanTier = profile?.plan === "premium" ? "premium" : "free";
  const { data: conflicts } = await admin
    .from("ingredient_conflicts")
    .select("ingredient_a, ingredient_b, severity, explanation_es, explanation_en");

  const generated = generateRoutine(shelf, conflicts ?? [], profile?.skin_goal ?? null, locale);
  const { data: existing } = await admin.from("routine_sets").select("id, is_active, name").eq("user_id", user.id);
  const active = (existing ?? []).find((row) => row.is_active);
  const limit = plan === "premium" ? PRO_ROUTINE_SET_LIMIT : FREE_ROUTINE_SET_LIMIT;
  const defaultName = locale === "en" ? "Home" : "Casa";
  const name = uniqueSetName(input?.name?.trim() || defaultName, (existing ?? []).map((row) => row.name));
  const asNew = Boolean(input?.asNew);

  if (asNew && (existing?.length ?? 0) >= limit) {
    return {
      ok: false,
      error: plan === "premium" ? "Llegaste al máximo de rutinas guardadas." : "El plan free permite una sola rutina.",
      hint: plan === "premium" ? "Quitá una para guardar otra." : "En Pro podés tener varias (casa, vacaciones).",
    };
  }

  let setId = active?.id;
  if (!setId || asNew) {
    await admin.from("routine_sets").update({ is_active: false }).eq("user_id", user.id);
    const { data: set, error: setError } = await admin
      .from("routine_sets")
      .insert({ user_id: user.id, name, is_active: true })
      .select("id")
      .single();
    if (setError || !set) {
      return { ok: false, error: "No se pudo guardar la rutina.", hint: "Intentá de nuevo en un momento." };
    }
    setId = set.id;
  } else {
    await admin.from("routines").delete().eq("routine_set_id", setId);
    if (input?.name?.trim()) {
      await admin.from("routine_sets").update({ name }).eq("id", setId);
    }
  }

  const rows = [
    ...generated.am.map((product, index) => ({
      user_id: user.id,
      routine_set_id: setId,
      time_of_day: "am" as TimeOfDay,
      step_order: index + 1,
      product_id: product.productId,
    })),
    ...generated.pm.map((product, index) => ({
      user_id: user.id,
      routine_set_id: setId,
      time_of_day: "pm" as TimeOfDay,
      step_order: index + 1,
      product_id: product.productId,
    })),
  ];

  if (rows.length) {
    const { error } = await admin.from("routines").insert(rows);
    if (error) {
      return { ok: false, error: "No se pudieron guardar los pasos.", hint: "Intentá generar de nuevo." };
    }
  }

  return { ok: true };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user };
}

function uniqueSetName(desired: string, taken: string[]) {
  const base = desired.slice(0, 40) || "Rutina";
  const lower = new Set(taken.map((item) => item.toLowerCase()));
  if (!lower.has(base.toLowerCase())) return base;
  for (let i = 2; i < 50; i += 1) {
    const next = `${base} ${i}`.slice(0, 40);
    if (!lower.has(next.toLowerCase())) return next;
  }
  return `${base} ${Date.now()}`.slice(0, 40);
}

function sameIdList(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
