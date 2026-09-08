import { AddProductFlow } from "@/components/products/add-product-flow";
import { getLocale } from "@/lib/i18n/locale";
import { ui } from "@/lib/i18n/ui";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";
  const locale = await getLocale();
  const t = ui(locale);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.addProduct}</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/70">{t.addProductHint}</p>
      <div className="mt-8">
        <AddProductFlow initialQuery={initialQuery} locale={locale} />
      </div>
    </div>
  );
}
