import type { ProductCategory } from "@/types/database";
import { detectIngredients, type KnownIngredientKey } from "@/lib/ingredients";

export type ObfProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  category: ProductCategory;
  ingredients: KnownIngredientKey[];
  rawIngredients: string | null;
};

export type ObfLookup = { found: true } & ObfProduct | { found: false; barcode: string };

type ObfApiProduct = {
  code?: string;
  _id?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  ingredients_text_es?: string;
  categories?: string;
  categories_tags?: string[];
};

type ObfResponse = {
  status: number;
  product?: ObfApiProduct;
};

const UA = {
  "User-Agent": "Puffi/0.1 (skincare helper; https://world.openbeautyfacts.org)",
  Accept: "application/json",
};

export function mapObfProduct(product: ObfApiProduct, fallbackBarcode = ""): ObfProduct {
  const name =
    product.product_name?.trim() ||
    product.product_name_en?.trim() ||
    "Producto sin nombre";
  const brand = product.brands?.split(",")[0]?.trim() || null;
  const imageUrl = product.image_front_url || product.image_url || null;
  const blob = [
    name,
    brand,
    product.categories,
    product.ingredients_text,
    product.ingredients_text_en,
    product.ingredients_text_es,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    barcode: String(product.code || product._id || fallbackBarcode),
    name,
    brand,
    imageUrl,
    category: inferCategory(product.categories_tags, blob),
    ingredients: detectIngredients(blob),
    rawIngredients:
      product.ingredients_text_es ||
      product.ingredients_text_en ||
      product.ingredients_text ||
      null,
  };
}

export async function lookupOpenBeautyFacts(barcode: string): Promise<ObfLookup> {
  const clean = barcode.replace(/\D/g, "");
  if (clean.length < 8) {
    return { found: false, barcode: clean };
  }

  try {
    const response = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${clean}.json`, {
      headers: UA,
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (response.status === 404) {
      return { found: false, barcode: clean };
    }

    if (!response.ok) {
      return { found: false, barcode: clean };
    }

    const data = (await response.json()) as ObfResponse;
    if (data.status === 0 || !data.product) {
      return { found: false, barcode: clean };
    }

    return { found: true, ...mapObfProduct(data.product, clean) };
  } catch {
    return { found: false, barcode: clean };
  }
}

export async function searchOpenBeautyFacts(query: string): Promise<ObfProduct[]> {
  const terms = simplifySearchQuery(query);
  if (terms.length < 2) return [];

  const url = new URL("https://world.openbeautyfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", terms);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "20");

  const response = await fetch(url.toString(), {
    headers: UA,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Open Beauty Facts (${response.status})`);
  }

  const data = (await response.json()) as { products?: ObfApiProduct[] };
  return (data.products ?? [])
    .map((product) => mapObfProduct(product))
    .filter((product) => product.barcode || product.name !== "Producto sin nombre");
}

function simplifySearchQuery(query: string) {
  const cleaned = query
    .replace(/[–—]/g, " ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter((word) => word.length > 1);
  return words.slice(0, 6).join(" ").slice(0, 80);
}

function inferCategory(tags: string[] | undefined, blob: string): ProductCategory {
  const haystack = `${(tags ?? []).join(" ")} ${blob}`.toLowerCase();
  if (/sun.?screen|spf|protector.?solar/.test(haystack)) return "sunscreen";
  if (/cleanser|limpiador|wash|gel.?nettoyant/.test(haystack)) return "cleanser";
  if (/toner|tonico|tónico/.test(haystack)) return "toner";
  if (/essence|esencia/.test(haystack)) return "essence";
  if (/serum|sérum|serums/.test(haystack)) return "serum";
  if (/exfoli|peel|aha|bha/.test(haystack)) return "exfoliant";
  if (/eye.?cream|contorno/.test(haystack)) return "eye_cream";
  if (/mask|mascarilla/.test(haystack)) return "mask";
  if (/\boil\b|aceite|occlus/.test(haystack)) return "oil";
  if (/moistur|hidrat|cream|crema/.test(haystack)) return "moisturizer";
  return "other";
}
