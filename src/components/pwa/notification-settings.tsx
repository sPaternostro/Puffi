"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { updateReminderPrefsAction } from "@/lib/push/actions";
import { urlBase64ToUint8Array } from "@/lib/push/vapid";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

type Perm = "unsupported" | "denied" | "default" | "granted";

export function NotificationSettings({
  locale,
  remindAm,
  remindPm,
}: {
  locale: AppLocale;
  remindAm: boolean;
  remindPm: boolean;
}) {
  const t = ui(locale);
  const [perm, setPerm] = useState<Perm>("default");
  const [am, setAm] = useState(remindAm);
  const [pm, setPm] = useState(remindPm);
  const [busy, setBusy] = useState(false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission as Perm);
  }, []);

  async function enable() {
    if (!vapid || perm === "unsupported") return;
    setBusy(true);
    const result = await Notification.requestPermission();
    setPerm(result as Perm);
    if (result !== "granted") {
      setBusy(false);
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      }));
    const json = subscription.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    await updateReminderPrefsAction({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setBusy(false);
  }

  async function toggle(which: "am" | "pm", value: boolean) {
    if (which === "am") setAm(value);
    else setPm(value);
    await updateReminderPrefsAction(which === "am" ? { remindAm: value } : { remindPm: value });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-foreground/65">{t.remindersHint}</p>
      {perm === "unsupported" ? (
        <p className="text-sm leading-6 text-foreground/70">{t.notificationsUnsupported}</p>
      ) : null}
      {perm === "denied" ? (
        <p className="text-sm leading-6 text-foreground/70">{t.notificationsDenied}</p>
      ) : null}
      {perm === "granted" ? (
        <p className="text-sm font-medium">{t.notificationsOn}</p>
      ) : perm === "default" && vapid ? (
        <button type="button" className="btn-secondary w-full sm:w-auto" disabled={busy} onClick={() => void enable()}>
          <Bell size={16} />
          {t.enableNotifications}
        </button>
      ) : perm !== "denied" && perm !== "unsupported" && !vapid ? (
        <p className="text-sm leading-6 text-foreground/70">{t.notificationsUnsupported}</p>
      ) : null}
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>{t.remindMorning}</span>
        <input type="checkbox" checked={am} onChange={(event) => void toggle("am", event.target.checked)} />
      </label>
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>{t.remindNight}</span>
        <input type="checkbox" checked={pm} onChange={(event) => void toggle("pm", event.target.checked)} />
      </label>
    </div>
  );
}
