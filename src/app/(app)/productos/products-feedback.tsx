"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export function ProductsFeedback({ added }: { added?: string }) {
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
      title: count === 1 ? "Ya está en tu estantería" : `Se agregaron ${count} productos`,
      detail: "Podés seguir agregando o generar la rutina.",
    });
    router.replace("/productos");
  }, [count, push, router]);

  return null;
}
