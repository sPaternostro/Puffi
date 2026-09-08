"use client";

import { Camera, ImagePlus } from "lucide-react";
import { useState } from "react";
import { INGREDIENT_OPTIONS } from "@/lib/ingredients";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";
import { Spinner } from "@/components/ui/spinner";
import type { ProductCategory } from "@/types/database";

export type ManualValues = {
  name: string;
  brand: string;
  category: ProductCategory;
  barcode: string;
  ingredients: string[];
  imageBase64?: string | null;
  imageMime?: string | null;
};

type Props = {
  initial?: Partial<ManualValues>;
  submitLabel?: string;
  onSubmit: (values: ManualValues) => Promise<void>;
};

export function ManualProductForm({ initial, submitLabel = "Guardar producto", onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "other");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? []);
  const [preview, setPreview] = useState<string | null>(initial?.imageBase64 ?? null);
  const [imageMime, setImageMime] = useState<string | null>(initial?.imageMime ?? null);
  const [saving, setSaving] = useState(false);

  function toggleIngredient(key: string) {
    setIngredients((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return;
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setImageMime(file.type || "image/jpeg");
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
          await onSubmit({
            name,
            brand,
            category,
            barcode,
            ingredients,
            imageBase64: preview,
            imageMime,
          });
        } finally {
          setSaving(false);
        }
      }}
    >
      <fieldset>
        <legend className="mb-2 text-sm">Foto (opcional)</legend>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="mb-3 h-28 w-28 rounded-xl object-cover" />
        ) : (
          <p className="mb-3 text-xs text-foreground/60">
            Si el producto viene de Open Beauty Facts, la foto se completa sola. Si lo cargás a
            mano, podés sacar una o subirla.
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <label className="btn-secondary cursor-pointer">
            <Camera size={16} />
            Cámara
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
          </label>
          <label className="btn-secondary cursor-pointer">
            <ImagePlus size={16} />
            Subir
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void onFile(event.target.files?.[0])}
            />
          </label>
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm">
        Nombre
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="input-field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Marca
        <input
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className="input-field"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Categoría
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ProductCategory)}
          className="input-field"
        >
          {PRODUCT_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Código de barras (opcional)
        <input
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          className="input-field"
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm">Activos principales</legend>
        <p className="text-xs text-foreground/60">
          Marcá los que aparecen en el envase. Sirve para detectar incompatibilidades.
        </p>
        <div className="flex flex-col gap-2">
          {INGREDIENT_OPTIONS.map((item) => (
            <label key={item.key} className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={ingredients.includes(item.key)}
                onChange={() => toggleIngredient(item.key)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" disabled={saving} className="btn-primary mt-2 ml-auto w-full sm:w-auto">
        {saving ? (
          <>
            <Spinner /> Guardando…
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
