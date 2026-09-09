import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { AM_HOUR, PM_HOUR } from "@/lib/push/vapid";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

function configure() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_SUBJECT ?? "mailto:puffi@localhost";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(email, publicKey, privateKey);
  return true;
}

function localParts(timeZone: string, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    hour: Number(map.hour),
    minute: Number(map.minute),
    date: `${map.year}-${map.month}-${map.day}`,
  };
}

export async function sendDueReminders() {
  if (!configure()) return { sent: 0, skipped: "missing-vapid" as const };

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth, last_am_sent_on, last_pm_sent_on");

  let sent = 0;
  for (const row of rows ?? []) {
    const { data: profile } = await admin
      .from("users")
      .select("locale, timezone, remind_am, remind_pm")
      .eq("id", row.user_id)
      .maybeSingle();
    if (!profile) continue;

    const { data: set } = await admin
      .from("routine_sets")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!set) continue;

    const { data: steps } = await admin
      .from("routines")
      .select("time_of_day")
      .eq("routine_set_id", set.id);

    const hasAm = (steps ?? []).some((step) => step.time_of_day === "am");
    const hasPm = (steps ?? []).some((step) => step.time_of_day === "pm");

    let local;
    try {
      local = localParts(profile.timezone || "America/Argentina/Buenos_Aires");
    } catch {
      continue;
    }

    const locale = (profile.locale === "en" ? "en" : "es") as AppLocale;
    const copy = ui(locale);

    const jobs: { kind: "am" | "pm"; due: boolean; last: string | null; title: string; body: string }[] = [
      {
        kind: "am",
        due: Boolean(profile.remind_am && hasAm && local.hour === AM_HOUR && row.last_am_sent_on !== local.date),
        last: row.last_am_sent_on,
        title: copy.pushAmTitle,
        body: copy.pushAmBody,
      },
      {
        kind: "pm",
        due: Boolean(profile.remind_pm && hasPm && local.hour === PM_HOUR && row.last_pm_sent_on !== local.date),
        last: row.last_pm_sent_on,
        title: copy.pushPmTitle,
        body: copy.pushPmBody,
      },
    ];

    for (const job of jobs) {
      if (!job.due) continue;
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify({ title: job.title, body: job.body, url: "/hoy" }),
        );
        await admin
          .from("push_subscriptions")
          .update(job.kind === "am" ? { last_am_sent_on: local.date } : { last_pm_sent_on: local.date })
          .eq("id", row.id);
        sent += 1;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", row.id);
        }
      }
    }
  }

  return { sent };
}
