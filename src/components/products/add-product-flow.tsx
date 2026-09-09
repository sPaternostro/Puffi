"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import {
  addCatalogProductAction,
  addExistingProductAction,
  addManualProductAction,
  lookupBarcodeAction,
  searchProductsAction,
  type ProductSearchHit,
} from "@/lib/products/actions";
import { ManualProductForm } from "@/components/products/manual-product-form";
import { Spinner } from "@/components/ui/spinner";
import { StatusMessage } from "@/components/ui/status-message";
import { useToast } from "@/components/ui/toast";
import { ingredientLabel } from "@/lib/ingredients";
import { categoryLabel } from "@/lib/product-categories";
import { ui } from "@/lib/i18n/ui";
import { useClientLocale } from "@/lib/i18n/client-locale";
import type { AppLocale } from "@/types/database";
import type { ProductCategory } from "@/types/database";

function OpeningCamera() {
  const locale = useClientLocale();
  return (
    <p className="flex items-center gap-2 text-sm text-foreground/70">
      <Spinner /> {ui(locale).openingCamera}
    </p>
  );
}

const BarcodeScanner = dynamic(
  () => import("@/components/products/barcode-scanner").then((mod) => mod.BarcodeScanner),
  {
    ssr: false,
    loading: () => <OpeningCamera />,
  },
);

type Mode = "choose" | "scan" | "search" | "manual";

type FoundProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  category: ProductCategory;
  ingredients: string[];
  rawIngredients: string | null;
};

export function AddProductFlow({
  initialQuery = "",
  locale,
}: {
  initialQuery?: string;
  locale: AppLocale;
}) {
  const t = ui(locale);
  const c = addCopy(locale);
  const router = useRouter();
  const { push } = useToast();
  const [mode, setMode] = useState<Mode>(initialQuery ? "search" : "choose");
  const [error, setError] = useState<{ title: string; hint?: string } | null>(null);
  const [found, setFound] = useState<FoundProduct | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<ProductSearchHit[] | null>(null);
  const [selected, setSelected] = useState<Record<string, ProductSearchHit>>({});
  const [lookingUp, setLookingUp] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState(c.addingShelf);
  const [scanLocked, setScanLocked] = useState(false);
  const picked = Object.values(selected);

  function goShelf(count = 1) {
    router.push(`/productos?added=${count}`);
    router.refresh();
  }

  async function handleBarcode(code: string) {
    if (scanLocked) return;
    setScanLocked(true);
    setError(null);
    setFound(null);
    setLookingUp(true);
    try {
      const result = await lookupBarcodeAction(code);
      if (!result.found) {
        setNotFoundBarcode(result.barcode);
        setMode("manual");
        push({
          kind: "info",
          title: "No está en el catálogo",
          detail: "Completá el formulario con los datos del envase.",
        });
        return;
      }
      setFound(result);
    } catch {
      setScanLocked(false);
      setError({
        title: "No se pudo consultar el código.",
        hint: "Revisá la conexión e intentá de nuevo, o cargalo a mano.",
      });
    } finally {
      setLookingUp(false);
    }
  }

  async function search() {
    setError(null);
    setSelected({});
    setSearching(true);
    try {
      const results = await searchProductsAction(query);
      setHits(results.hits);
      if (results.warning) {
        setError({ title: results.warning });
      }
    } catch {
      setError({
        title: "No se pudo buscar.",
        hint: "Probá un nombre más corto, como la marca («CeraVe»), o cargalo a mano.",
      });
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (!initialQuery) return;
    void search();
    // Run once on mount when coming from a suggestion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleHit(hit: ProductSearchHit) {
    setSelected((current) => {
      if (current[hit.key]) {
        const next = { ...current };
        delete next[hit.key];
        return next;
      }
      return { ...current, [hit.key]: hit };
    });
  }

  async function addHits(hitsToAdd: ProductSearchHit[]) {
    if (saving || hitsToAdd.length === 0) return;
    setSaving(true);
    setError(null);
    let added = 0;
    for (const [index, hit] of hitsToAdd.entries()) {
      setSavingLabel(
        hitsToAdd.length === 1
          ? c.addingNamed.replace("{name}", hit.name)
          : c.addingIndex.replace("{index}", String(index + 1)).replace("{total}", String(hitsToAdd.length)),
      );
      const result = hit.localId
        ? await addExistingProductAction(hit.localId)
        : hit.barcode
          ? await addCatalogProductAction({
              barcode: hit.barcode,
              name: hit.name,
              brand: hit.brand,
              category: hit.category,
              imageUrl: hit.imageUrl,
              ingredients: hit.ingredients,
            })
          : { ok: false as const, error: "Este resultado no tiene código para guardar.", hint: "Cargalo a mano." };
      if (!result.ok) {
        setSaving(false);
        setError({
          title: added > 0 ? `Se agregaron ${added}, pero falló el siguiente.` : result.error,
          hint: result.hint,
        });
        if (added > 0) goShelf(added);
        return;
      }
      added += 1;
    }
    goShelf(added);
  }

  return (
    <div className="relative flex flex-col gap-6">
      {saving ? (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#f7f4f0]/88 px-6 backdrop-blur-sm">
          <Spinner className="h-7 w-7" />
          <p className="mt-4 text-center text-sm font-medium">{savingLabel}</p>
        </div>
      ) : null}

      <button
        type="button"
        className="btn-secondary h-10 self-start px-3 text-sm"
        onClick={() => {
          if (found || mode !== "choose") {
            setFound(null);
            setMode("choose");
            setNotFoundBarcode(null);
            setError(null);
            setHits(null);
            setSelected({});
            setScanLocked(false);
            return;
          }
          router.push("/productos");
        }}
      >
        <ChevronLeft size={16} />
        {t.back}
      </button>

      {error ? (
        <StatusMessage kind="error" title={error.title}>
          {error.hint}
        </StatusMessage>
      ) : null}

      {lookingUp ? (
        <p className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm text-foreground/70">
          <Spinner /> {t.lookingUpProduct}
        </p>
      ) : null}

      {found ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-5">
          {found.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={found.imageUrl} alt="" className="h-36 w-36 rounded-xl object-cover" />
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-wide text-foreground/50">{found.brand}</p>
            <h2 className="text-xl font-semibold">{found.name}</h2>
            <p className="mt-1 text-sm text-foreground/70">{categoryLabel(found.category, locale)}</p>
          </div>
          {found.ingredients.length > 0 ? (
            <p className="text-sm text-foreground/80">
              {t.detectedActives}: {found.ingredients.map((key) => ingredientLabel(key, locale)).join(", ")}
            </p>
          ) : (
            <p className="text-sm text-foreground/70">
              No detectamos activos de la lista. Podés agregarlo igual.
            </p>
          )}
          <button
            type="button"
            disabled={saving}
            className="btn-primary"
            onClick={async () => {
              setSaving(true);
              setSavingLabel(c.addingShelf);
              setError(null);
              const result = await addCatalogProductAction({
                barcode: found.barcode,
                name: found.name,
                brand: found.brand,
                category: found.category,
                imageUrl: found.imageUrl,
                ingredients: found.ingredients,
              });
              if (!result.ok) {
                setSaving(false);
                setError({ title: result.error, hint: result.hint });
                return;
              }
              goShelf();
            }}
          >
            {saving ? (
              <>
                <Spinner /> {c.adding}
              </>
            ) : (
              c.addToShelf
            )}
          </button>
          <button
            type="button"
            className="text-sm text-foreground/70"
            onClick={() => {
              setNotFoundBarcode(found.barcode);
              setFound(null);
              setMode("manual");
            }}
          >
            {c.notThis}
          </button>
        </div>
      ) : null}

      {!found && mode === "choose" ? (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
          {[
            { id: "scan" as const, title: c.scanTitle, detail: c.scanDetail },
            { id: "search" as const, title: c.searchTitle, detail: c.searchDetail },
            { id: "manual" as const, title: c.manualTitle, detail: c.manualDetail },
          ].map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`px-5 py-4 text-left hover:bg-background ${index > 0 ? "border-t border-line" : ""}`}
              onClick={() => setMode(item.id)}
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-foreground/60">{item.detail}</p>
            </button>
          ))}
        </div>
      ) : null}

      {!found && mode === "scan" ? (
        <div className="flex min-w-0 max-w-full flex-col gap-4">
          {scanLocked ? null : <BarcodeScanner onDetected={(code) => void handleBarcode(code)} />}
          <ManualBarcodeFallback
            onLookup={(code) => void handleBarcode(code)}
            loading={lookingUp}
            locale={locale}
          />
        </div>
      ) : null}

      {!found && mode === "search" ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={c.searchPlaceholder}
              className="input-field flex-1"
              onKeyDown={(event) => {
                if (event.key === "Enter") void search();
              }}
            />
            <button type="button" onClick={() => void search()} className="btn-primary shrink-0" disabled={searching}>
              {searching ? <Spinner /> : t.search}
            </button>
          </div>
          <p className="text-xs leading-5 text-foreground/55">
            Usá 2 a 4 palabras (marca + tipo). Pegar el nombre entero del catálogo suele no
            devolver nada.
          </p>
          {searching ? (
            <p className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm">
              <Spinner /> {t.searchingProducts}
            </p>
          ) : null}
          {hits && hits.length === 0 && !searching ? (
            <StatusMessage kind="info" title="No encontramos ese nombre.">
              Probá solo la marca, o{" "}
              <button type="button" className="underline" onClick={() => setMode("manual")}>
                cargalo a mano
              </button>
              .
            </StatusMessage>
          ) : null}
          {hits && hits.length > 0 ? (
            <>
              <p className="text-sm text-foreground/65">Podés marcar varios y agregarlos juntos.</p>
              <ul className="overflow-hidden rounded-2xl border border-line bg-card pb-28">
                {hits.map((hit, index) => {
                  const active = Boolean(selected[hit.key]);
                  return (
                    <li key={hit.key} className={index > 0 ? "border-t border-line" : ""}>
                      <button
                        type="button"
                        disabled={saving}
                        className={`flex w-full items-center gap-3 p-4 text-left ${
                          active ? "bg-accent/50" : "hover:bg-background"
                        }`}
                        onClick={() => toggleHit(hit)}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            active ? "border-primary-strong bg-primary-strong text-[#fffaf6]" : "border-line bg-background"
                          }`}
                        >
                          {active ? <Check size={14} /> : null}
                        </span>
                        {hit.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={hit.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-xs text-foreground/40">
                            —
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{hit.name}</p>
                          <p className="text-sm text-foreground/60">{hit.brand ?? t.noBrand}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-[45] px-4 md:bottom-8">
                <div className="pointer-events-auto mx-auto max-w-xl">
                  <button
                    type="button"
                    className="btn-primary btn-lg shadow-lg"
                    disabled={picked.length === 0 || saving}
                    onClick={() => void addHits(picked)}
                  >
                    {saving ? (
                      <>
                        <Spinner /> {c.adding}
                      </>
                    ) : picked.length === 0 ? (
                      c.pickSome
                    ) : picked.length === 1 ? (
                      c.addNamed.replace("{name}", picked[0].name)
                    ) : (
                      c.addCount.replace("{count}", String(picked.length))
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {!found && mode === "manual" ? (
        <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <ManualProductForm
            initial={{ barcode: notFoundBarcode ?? "" }}
            locale={locale}
            submitLabel={c.saveAndAdd}
            onSubmit={async (values) => {
              setSaving(true);
              setSavingLabel(c.savingProduct);
              const result = await addManualProductAction(values);
              if (!result.ok) {
                setSaving(false);
                setError({ title: result.error, hint: result.hint });
                return;
              }
              goShelf();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ManualBarcodeFallback({
  onLookup,
  loading,
  locale,
}: {
  onLookup: (code: string) => void;
  loading: boolean;
  locale: AppLocale;
}) {
  const t = ui(locale);
  const c = addCopy(locale);
  const [code, setCode] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (code.trim()) onLookup(code.trim());
      }}
    >
      <input
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder={c.codePlaceholder}
        className="input-field flex-1"
      />
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <Spinner /> : t.search}
      </button>
    </form>
  );
}

function addCopy(locale: AppLocale) {
  if (locale === "en") {
    return {
      addingShelf: "Adding to your shelf…",
      scanTitle: "Scan barcode",
      scanDetail: "Use the camera or type the number.",
      searchTitle: "Search by name",
      searchDetail: "Search by brand or a short name.",
      manualTitle: "Add it myself",
      manualDetail: "Name, brand, category, and actives.",
      searchPlaceholder: "Brand or short name, e.g. CeraVe",
      saveAndAdd: "Save and add",
      codePlaceholder: "Or type the barcode",
      adding: "Adding…",
      addToShelf: "Add to my shelf",
      notThis: "Not this one — add by hand",
      pickSome: "Pick one or more",
      addNamed: "Add “{name}”",
      addCount: "Add {count} products",
      savingProduct: "Saving your product…",
      addingNamed: "Adding “{name}”…",
      addingIndex: "Adding {index} of {total}…",
    };
  }
  return {
    addingShelf: "Agregando a tu estantería…",
    scanTitle: "Escanear código de barras",
    scanDetail: "Usá la cámara o escribí el número.",
    searchTitle: "Buscar por nombre",
    searchDetail: "Buscá por marca o un nombre corto.",
    manualTitle: "Cargarlo yo",
    manualDetail: "Nombre, marca, categoría y activos.",
    searchPlaceholder: "Marca o nombre corto, ej. CeraVe",
    saveAndAdd: "Guardar y agregar",
    codePlaceholder: "O escribí el código",
    adding: "Agregando…",
    addToShelf: "Agregar a mi estantería",
    notThis: "No es este, cargarlo a mano",
    pickSome: "Elegí uno o más",
    addNamed: "Agregar «{name}»",
    addCount: "Agregar {count} productos",
    savingProduct: "Guardando tu producto…",
    addingNamed: "Agregando «{name}»…",
    addingIndex: "Agregando {index} de {total}…",
  };
}
