import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/types/database";

export const LOCALE_COOKIE = "puffi-locale";

export async function getLocale(): Promise<AppLocale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "en" || fromCookie === "es") return fromCookie;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("users").select("locale").eq("id", user.id).maybeSingle();
      if (data?.locale === "en" || data?.locale === "es") return data.locale;
    }
  } catch {
    /* no session */
  }

  return "es";
}
