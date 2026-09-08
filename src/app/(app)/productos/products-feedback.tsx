"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import type { AppLocale } from "@/types/database";

export function ProductsFeedback({ added, locale }: { added?: string; locale: AppLocale }) {
  const router = useRouter();
  const { push } = useToast();
  const count = Number(added ?? 0);

  useEffect(() => {
    if (!Number.isFinite(count) || count < 1) {
      sessionStorage.removeItem("puffi-added-toast");
      return;
    }

    if (sessionStorage.getItem("puffi-added-toast") === "1") {
      router.replace("/productos");
      return;
    }
    sessionStorage.setItem("puffi-added-toast", "1");

    push({
      kind: "success",
      title:
        locale === "en"
          ? count === 1
            ? "It’s on your shelf"
            : `${count} products added`
          : count === 1
            ? "Ya está en tu estantería"
            : `Se agregaron ${count} productos`,
      detail:
        locale === "en"
          ? "You can keep adding or generate the routine."
          : "Podés seguir agregando o generar la rutina.",
    });
    router.replace("/productos");
  }, [count, locale, push, router]);

  return null;
}
