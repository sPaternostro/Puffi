"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { removeUserProductAction } from "@/lib/products/actions";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

export function RemoveProductButton({ id }: { id: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-foreground/55 hover:bg-background hover:text-foreground disabled:opacity-60"
      aria-label="Quitar producto"
      onClick={async () => {
        setPending(true);
        const result = await removeUserProductAction(id);
        setPending(false);
        if (!result.ok) {
          push({ kind: "error", title: result.error, detail: result.hint });
          return;
        }
        push({ kind: "success", title: "Listo", detail: "Lo sacamos de tu estantería." });
        router.refresh();
      }}
    >
      {pending ? <Spinner /> : <Trash2 size={15} />}
      Quitar
    </button>
  );
}
