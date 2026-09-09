"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function activateRoutineSetAction(id: string) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { data: set } = await admin.from("routine_sets").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!set) return { ok: false as const };
  await admin.from("routine_sets").update({ is_active: false }).eq("user_id", user.id);
  await admin.from("routine_sets").update({ is_active: true }).eq("id", id);
  return { ok: true as const };
}

export async function renameRoutineSetAction(id: string, name: string) {
  const { user } = await requireUser();
  const trimmed = name.trim().slice(0, 40);
  if (!trimmed) return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("routine_sets").update({ name: trimmed }).eq("id", id).eq("user_id", user.id);
  return error ? { ok: false as const } : { ok: true as const };
}

export async function deleteRoutineSetAction(id: string) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { data: sets } = await admin.from("routine_sets").select("id, is_active").eq("user_id", user.id);
  if ((sets?.length ?? 0) <= 1) return { ok: false as const };
  const target = sets?.find((row) => row.id === id);
  if (!target) return { ok: false as const };
  await admin.from("routine_sets").delete().eq("id", id).eq("user_id", user.id);
  if (target.is_active) {
    const next = sets?.find((row) => row.id !== id);
    if (next) await admin.from("routine_sets").update({ is_active: true }).eq("id", next.id);
  }
  return { ok: true as const };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user };
}
