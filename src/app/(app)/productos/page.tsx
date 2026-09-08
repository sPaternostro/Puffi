import Link from "next/link";
import { ImageOff, Plus } from "lucide-react";
import { GenerateRoutineButton } from "@/components/routine/generate-routine-button";
import { RoutineRefreshBanner } from "@/components/routine/routine-refresh-banner";
import { RemoveProductButton } from "@/components/products/remove-product-button";
import { ProductsFeedback } from "@/app/(app)/productos/products-feedback";
import { getShelfAction } from "@/lib/products/actions";
import { getRoutineAction } from "@/lib/routine/actions";
import { ingredientLabel } from "@/lib/ingredients";
import { categoryLabel } from "@/lib/product-categories";
import { FREE_PRODUCT_LIMIT, MIN_PRODUCTS_FOR_ROUTINE } from "@/lib/plans";
import { getLocale } from "@/lib/i18n/locale";
import { fill, ui, displayProductName } from "@/lib/i18n/ui";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  const shelf = await getShelfAction();
  const { routine, needsRefresh } = await getRoutineAction();
  const params = await searchParams;
  const locale = await getLocale();
  const t = ui(locale);

  return (
    <div>
      <ProductsFeedback added={params.added} locale={locale} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.products}</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/70">
            {shelf.length === 0
              ? t.emptyShelfLead
              : fill(t.shelfCount, {
                  count: shelf.length,
                  s: shelf.length === 1 ? "" : "s",
                  max: FREE_PRODUCT_LIMIT,
                })}
          </p>
        </div>
        {shelf.length >= MIN_PRODUCTS_FOR_ROUTINE && !routine ? (
          <GenerateRoutineButton label={t.generateRoutine} redirectTo="/rutina" locale={locale} />
        ) : null}
      </div>
      {needsRefresh ? (
        <div className="mt-6">
          <RoutineRefreshBanner locale={locale} />
        </div>
      ) : null}

      {shelf.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-8">
          <p className="font-medium">{t.noProductsYet}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{t.emptyShelfHint}</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {shelf.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-background text-foreground/35">
                  <ImageOff size={18} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{displayProductName(item.name, locale)}</p>
                <p className="text-sm text-foreground/60">
                  {item.brand ?? t.noBrand} · {categoryLabel(item.category, locale)}
                </p>
                {item.ingredients.length > 0 ? (
                  <p className="mt-1 text-xs text-foreground/50">
                    {item.ingredients.map((key) => ingredientLabel(key, locale)).join(" · ")}
                  </p>
                ) : null}
              </div>
              <RemoveProductButton id={item.id} locale={locale} />
            </li>
          ))}
        </ul>
      )}

      <Link href="/productos/agregar" className="btn-primary btn-lg mt-6">
        <Plus size={18} />
        {t.addProduct}
      </Link>
    </div>
  );
}
