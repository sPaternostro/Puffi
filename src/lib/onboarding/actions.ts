"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SkinGoal, SkinType } from "@/types/database";

export async function completeOnboardingAction(input: {
  skinGoal: SkinGoal | null;
  skinType: SkinType | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  await admin
    .from("users")
    .update({
      skin_goal: input.skinGoal,
      skin_type: input.skinType,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  redirect("/productos");
}
