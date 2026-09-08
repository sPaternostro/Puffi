"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getRoutineAction } from "@/lib/routine/actions";
import { logKey, todayStamp } from "@/lib/today/keys";
import type { TimeOfDay } from "@/types/database";

export async function getTodayChecklistAction() {
  const { user } = await requireUser();
  const { shelfCount, min, needsRefresh, routine } = await getRoutineAction();
  const date = todayStamp();

  if (!routine) {
    return { date, shelfCount, min, needsRefresh: false, routine: null, done: {} as Record<string, boolean> };
  }

  const admin = createAdminClient();
  const { data: logs } = await admin
    .from("routine_logs")
    .select("product_id, time_of_day, completed")
    .eq("user_id", user.id)
    .eq("date", date);

  const done: Record<string, boolean> = {};
  for (const log of logs ?? []) {
    done[logKey(log.time_of_day, log.product_id)] = log.completed;
  }

  return { date, shelfCount, min, needsRefresh, routine, done };
}

export async function toggleTodayStepAction(input: {
  productId: string;
  timeOfDay: TimeOfDay;
  completed: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const date = todayStamp();

  const { error } = await admin.from("routine_logs").upsert(
    {
      user_id: user.id,
      date,
      product_id: input.productId,
      time_of_day: input.timeOfDay,
      completed: input.completed,
      completed_at: input.completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,date,product_id,time_of_day" },
  );

  if (error) {
    return { ok: false, error: "No se pudo guardar el tildado. Probá de nuevo." };
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
