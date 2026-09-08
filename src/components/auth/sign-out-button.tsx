"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

export function SignOutButton({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, setPending] = useState(false);
  const t = ui(locale);

  async function onSignOut() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setPending(false);
      push({
        kind: "error",
        title: "No se pudo cerrar la sesión.",
        detail: "Revisá la conexión e intentá de nuevo.",
      });
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={onSignOut} disabled={pending} className="btn-secondary w-full">
      {pending ? (
        <>
            <Spinner /> {t.signingOut}
          </>
        ) : (
          t.signOut
        )}
    </button>
  );
}
