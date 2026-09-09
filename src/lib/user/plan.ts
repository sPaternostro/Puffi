import { createClient } from "@/lib/supabase/server";
import type { PlanTier } from "@/types/database";

export async function getSessionPlan(): Promise<PlanTier> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "free";
  const { data } = await supabase.from("users").select("plan").eq("id", user.id).maybeSingle();
  return data?.plan === "premium" ? "premium" : "free";
}
