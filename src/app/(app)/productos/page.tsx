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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  const shelf = await getShelfAction();
  const { routine, needsRefresh } = await getRoutineAction();
  const params = await searchParams;

  return (
    <div>
      <ProductsFeedback added={params.added} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Productos</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/70">
            {shelf.length === 0
              ? "Cargá lo que ya tenés (o lo que querés comprar). Con 1 producto ya podés generar la rutina. El plan free permite hasta 8."
              : `${shelf.length} producto${shelf.length === 1 ? "" : "s"} · máximo ${FREE_PRODUCT_LIMIT} en plan free.`}
          </p>
        </div>
        {shelf.length >= MIN_PRODUCTS_FOR_ROUTINE && !routine ? (
          <GenerateRoutineButton label="Generar rutina" redirectTo="/rutina" />
        ) : null}
      </div>
      {needsRefresh ? <div className="mt-6"><RoutineRefreshBanner /></div> : null}

      {shelf.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-8">
          <p className="font-medium">Todavía no hay productos</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            Escaneá, buscá por marca o cargá a mano. Después generá el orden de mañana y noche.
          </p>
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
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm text-foreground/60">
                  {item.brand ?? "Sin marca"} · {categoryLabel(item.category)}
                </p>
                {item.ingredients.length > 0 ? (
                  <p className="mt-1 text-xs text-foreground/50">
                    {item.ingredients.map(ingredientLabel).join(" · ")}
                  </p>
                ) : null}
              </div>
              <RemoveProductButton id={item.id} />
            </li>
          ))}
        </ul>
      )}

      <Link href="/productos/agregar" className="btn-primary btn-lg mt-6">
        <Plus size={18} />
        Agregar producto
      </Link>
    </div>
  );
}
