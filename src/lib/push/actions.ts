"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateReminderPrefsAction(input: {
  remindAm?: boolean;
  remindPm?: boolean;
  timezone?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  const patch: { remind_am?: boolean; remind_pm?: boolean; timezone?: string } = {};
  if (typeof input.remindAm === "boolean") patch.remind_am = input.remindAm;
  if (typeof input.remindPm === "boolean") patch.remind_pm = input.remindPm;
  if (input.timezone && input.timezone.length < 80) patch.timezone = input.timezone;

  if (Object.keys(patch).length === 0) return { ok: true as const };
  const { error } = await supabase.from("users").update(patch).eq("id", user.id);
  return error ? { ok: false as const } : { ok: true as const };
}
