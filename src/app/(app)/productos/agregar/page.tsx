import { AddProductFlow } from "@/components/products/add-product-flow";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Agregar producto</h1>
      <p className="mt-2 text-sm leading-6 text-foreground/70">
        Escaneá, buscá por marca o cargalo a mano. Si el catálogo trae foto, se completa sola.
      </p>
      <div className="mt-8">
        <AddProductFlow initialQuery={initialQuery} />
      </div>
    </div>
  );
}
