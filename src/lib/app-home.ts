import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Where to land after login, or when opening `/` already logged in. */
export async function resolveAppHomePath(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) return "/onboarding";

  const { count: shelfCount } = await admin
    .from("user_products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((shelfCount ?? 0) === 0) return "/productos";

  const { data: routine } = await admin
    .from("routine_sets")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!routine) return "/rutina";
  return "/hoy";
}
