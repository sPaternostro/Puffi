import Link from "next/link";
import { legalCopy } from "@/lib/legal";
import type { AppLocale } from "@/types/database";

export function LegalFooter({ locale }: { locale: AppLocale }) {
  const copy = legalCopy(locale);
  return (
    <p className="mt-10 text-center text-xs leading-5 text-foreground/50">
      {copy.short}{" "}
      <Link href="/legal" className="underline underline-offset-2">
        {locale === "en" ? "Legal notice" : "Aviso legal"}
      </Link>
    </p>
  );
}
