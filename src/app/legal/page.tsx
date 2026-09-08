import { legalCopy } from "@/lib/legal";
import { getLocale } from "@/lib/i18n/locale";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import Link from "next/link";

export default async function LegalPage() {
  const locale = await getLocale();
  const copy = legalCopy(locale);
  const en = locale === "en";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="btn-secondary h-10 px-3 text-sm">
          {en ? "← Back" : "← Volver"}
        </Link>
        <LocaleSwitcher locale={locale} />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {en ? "Legal notice" : "Aviso legal"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-foreground/75">{copy.short}</p>
      <div className="mt-8 space-y-6">
        {copy.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-medium">{section.title}</h2>
            <p className="mt-2 text-sm leading-7 text-foreground/75">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
