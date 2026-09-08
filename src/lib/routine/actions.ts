"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getShelfAction, type ShelfProduct } from "@/lib/products/actions";
import { generateRoutine, type GeneratedRoutine } from "@/lib/routine/engine";
import { MIN_PRODUCTS_FOR_ROUTINE } from "@/lib/plans";
import { getLocale } from "@/lib/i18n/locale";
import type { TimeOfDay } from "@/types/database";

export type SavedRoutine = GeneratedRoutine & {
  generatedAt: string | null;
};

export async function getRoutineAction(): Promise<{
  shelfCount: number;
  min: number;
  needsRefresh: boolean;
  routine: SavedRoutine | null;
}> {
  const { user } = await requireUser();
  const shelf = await getShelfAction();
  const admin = createAdminClient();

  const { data: set } = await admin
    .from("routine_sets")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!set) {
    return { shelfCount: shelf.length, min: MIN_PRODUCTS_FOR_ROUTINE, needsRefresh: false, routine: null };
  }

  const { data: steps } = await admin
    .from("routines")
    .select("time_of_day, step_order, product_id")
    .eq("routine_set_id", set.id)
    .order("step_order");

  const shelfIds = new Set(shelf.map((item) => item.productId));
  const routineIds = new Set((steps ?? []).map((step) => step.product_id));
  const needsRefresh =
    [...shelfIds].some((id) => !routineIds.has(id)) || [...routineIds].some((id) => !shelfIds.has(id));

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
  const { data: profile } = await admin
    .from("users")
    .select("skin_goal")
    .eq("id", user.id)
    .maybeSingle();
  const { data: conflicts } = await admin
    .from("ingredient_conflicts")
    .select("ingredient_a, ingredient_b, severity, explanation_es, explanation_en");

  const live = generateRoutine(shelf, conflicts ?? [], profile?.skin_goal ?? null, locale);

  return {
    shelfCount: shelf.length,
    min: MIN_PRODUCTS_FOR_ROUTINE,
    needsRefresh,
    routine: {
      am,
      pm,
      warnings: live.warnings,
      suggestions: live.suggestions,
      generatedAt: set.created_at,
    },
  };
}

export async function generateRoutineAction(): Promise<
  | { ok: true }
  | { ok: false; error: string; hint?: string }
> {
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
    .select("skin_goal")
    .eq("id", user.id)
    .maybeSingle();
  const { data: conflicts } = await admin
    .from("ingredient_conflicts")
    .select("ingredient_a, ingredient_b, severity, explanation_es, explanation_en");

  const generated = generateRoutine(shelf, conflicts ?? [], profile?.skin_goal ?? null, locale);

  await admin.from("routine_sets").update({ is_active: false }).eq("user_id", user.id);

  const { data: set, error: setError } = await admin
    .from("routine_sets")
    .insert({ user_id: user.id, name: "principal", is_active: true })
    .select("id")
    .single();

  if (setError || !set) {
    return { ok: false, error: "No se pudo guardar la rutina.", hint: "Intentá de nuevo en un momento." };
  }

  const rows = [
    ...generated.am.map((product, index) => ({
      user_id: user.id,
      routine_set_id: set.id,
      time_of_day: "am" as TimeOfDay,
      step_order: index + 1,
      product_id: product.productId,
    })),
    ...generated.pm.map((product, index) => ({
      user_id: user.id,
      routine_set_id: set.id,
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
