"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { lookupOpenBeautyFacts, searchOpenBeautyFacts } from "@/lib/open-beauty-facts";
import { FREE_PRODUCT_LIMIT } from "@/lib/plans";
import type { ProductCategory } from "@/types/database";

export type ShelfProduct = {
  id: string;
  productId: string;
  name: string;
  brand: string | null;
  category: ProductCategory;
  imageUrl: string | null;
  ingredients: string[];
};

export type ActionResult = { ok: true } | { ok: false; error: string; hint?: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

async function assertCanAddProduct(userId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  const { count } = await admin
    .from("user_products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((profile?.plan ?? "free") === "free" && (count ?? 0) >= FREE_PRODUCT_LIMIT) {
    return {
      ok: false,
      error: `Llegaste al máximo de ${FREE_PRODUCT_LIMIT} productos del plan free.`,
      hint: "Quitá uno de la estantería o, más adelante, pasate a premium.",
    };
  }
  return { ok: true };
}

export async function lookupBarcodeAction(barcode: string) {
  await requireUser();
  try {
    return await lookupOpenBeautyFacts(barcode);
  } catch {
    return { found: false as const, barcode: barcode.replace(/\D/g, "") };
  }
}

export type ProductSearchHit = {
  key: string;
  localId: string | null;
  barcode: string | null;
  name: string;
  brand: string | null;
  category: ProductCategory;
  imageUrl: string | null;
  ingredients: string[];
  origin: "local" | "openbeautyfacts";
};

export async function searchProductsAction(query: string): Promise<{
  hits: ProductSearchHit[];
  warning?: string;
}> {
  await requireUser();
  const term = query.trim();
  if (term.length < 2) return { hits: [] };

  const admin = createAdminClient();
  const ilike = term.replace(/[%(),]/g, " ").replace(/\s+/g, " ").trim();

  let local: { id: string; name: string; brand: string | null; category: ProductCategory; image_url: string | null; barcode: string | null }[] = [];
  if (ilike.length >= 2) {
    const { data, error } = await admin
      .from("products")
      .select("id, name, brand, category, image_url, barcode")
      .or(`name.ilike.%${ilike}%,brand.ilike.%${ilike}%`)
      .limit(10);
    if (!error) {
      local = data ?? [];
    }
  }

  let obf: Awaited<ReturnType<typeof searchOpenBeautyFacts>> = [];
  let warning: string | undefined;
  try {
    obf = await searchOpenBeautyFacts(term);
  } catch {
    warning =
      "No pudimos consultar Open Beauty Facts ahora. Probá un nombre más corto (marca + tipo, ej. «CeraVe limpiador») o cargalo a mano.";
  }

  const localHits: ProductSearchHit[] = local.map((row) => ({
    key: `local-${row.id}`,
    localId: row.id,
    barcode: row.barcode,
    name: row.name,
    brand: row.brand,
    category: row.category,
    imageUrl: row.image_url,
    ingredients: [],
    origin: "local",
  }));

  const localBarcodes = new Set(localHits.map((hit) => hit.barcode).filter(Boolean));
  const obfHits: ProductSearchHit[] = obf
    .filter((product) => !product.barcode || !localBarcodes.has(product.barcode))
    .map((product) => ({
      key: `obf-${product.barcode || product.name}`,
      localId: null,
      barcode: product.barcode || null,
      name: product.name,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl,
      ingredients: product.ingredients,
      origin: "openbeautyfacts" as const,
    }));

  return { hits: [...localHits, ...obfHits].slice(0, 20), warning };
}

export async function addExistingProductAction(productId: string): Promise<ActionResult> {
  const { user } = await requireUser();
  const limit = await assertCanAddProduct(user.id);
  if (!limit.ok) return limit;

  const admin = createAdminClient();
  const { error } = await admin.from("user_products").upsert(
    { user_id: user.id, product_id: productId },
    { onConflict: "user_id,product_id", ignoreDuplicates: true },
  );

  if (error) {
    return {
      ok: false,
      error: "No se pudo agregar el producto a tu estantería.",
      hint: "Revisá tu conexión e intentá de nuevo en unos segundos.",
    };
  }
  return { ok: true };
}

export async function addCatalogProductAction(input: {
  barcode: string;
  name: string;
  brand: string | null;
  category: ProductCategory;
  imageUrl: string | null;
  ingredients: string[];
}): Promise<ActionResult> {
  const { user } = await requireUser();
  const limit = await assertCanAddProduct(user.id);
  if (!limit.ok) return limit;

  const admin = createAdminClient();
  const barcode = input.barcode.replace(/\D/g, "");

  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("barcode", barcode)
    .maybeSingle();

  let productId = existing?.id;

  if (!productId) {
    const { data: created, error } = await admin
      .from("products")
      .insert({
        barcode,
        name: input.name.trim(),
        brand: input.brand?.trim() || null,
        category: input.category,
        source: "openbeautyfacts",
        image_url: input.imageUrl,
      })
      .select("id")
      .single();

    if (error || !created) {
      return {
        ok: false,
        error: "No se pudo guardar el producto del catálogo.",
        hint: "Intentá escanear de nuevo o cargalo a mano.",
      };
    }
    productId = created.id;
  }

  await syncIngredients(productId, input.ingredients);

  const { error: linkError } = await admin.from("user_products").upsert(
    { user_id: user.id, product_id: productId },
    { onConflict: "user_id,product_id", ignoreDuplicates: true },
  );

  if (linkError) {
    return {
      ok: false,
      error: "No se pudo agregar a tu estantería.",
      hint: "Buscalo por nombre en Agregar producto e intentá otra vez.",
    };
  }
  return { ok: true };
}

export async function addManualProductAction(input: {
  name: string;
  brand: string;
  category: ProductCategory;
  barcode: string;
  ingredients: string[];
  imageBase64?: string | null;
  imageMime?: string | null;
}): Promise<ActionResult> {
  const { user } = await requireUser();
  const limit = await assertCanAddProduct(user.id);
  if (!limit.ok) return limit;

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "El nombre es obligatorio.", hint: "Completá el nombre y volvé a guardar." };
  }

  const admin = createAdminClient();
  const barcode = input.barcode.replace(/\D/g, "") || null;

  if (barcode) {
    const { data: existing } = await admin
      .from("products")
      .select("id")
      .eq("barcode", barcode)
      .maybeSingle();
    if (existing) {
      return addExistingProductAction(existing.id);
    }
  }

  const { data: created, error } = await admin
    .from("products")
    .insert({
      barcode,
      name,
      brand: input.brand.trim() || null,
      category: input.category,
      source: "manual",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !created) {
    return {
      ok: false,
      error: "No se pudo guardar el producto.",
      hint: "Revisá que el nombre esté completo e intentá de nuevo.",
    };
  }

  if (input.imageBase64) {
    const imageUrl = await uploadProductImage(
      user.id,
      created.id,
      input.imageBase64,
      input.imageMime ?? "image/jpeg",
    );
    if (imageUrl) {
      await admin.from("products").update({ image_url: imageUrl }).eq("id", created.id);
    }
  }

  await syncIngredients(created.id, input.ingredients);

  const { error: linkError } = await admin.from("user_products").insert({
    user_id: user.id,
    product_id: created.id,
  });

  if (linkError) {
    return {
      ok: false,
      error: "No se pudo agregar a tu estantería.",
      hint: "Volvé a Productos y, si no aparece, cargalo otra vez.",
    };
  }
  return { ok: true };
}

export async function removeUserProductAction(userProductId: string): Promise<ActionResult> {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_products")
    .delete()
    .eq("id", userProductId)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      error: "No se pudo quitar el producto.",
      hint: "Revisá tu conexión e intentá de nuevo.",
    };
  }
  return { ok: true };
}

export async function getShelfAction(): Promise<ShelfProduct[]> {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { data: links, error } = await admin
    .from("user_products")
    .select("id, product_id")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error || !links?.length) {
    return [];
  }

  const productIds = links.map((row) => row.product_id);
  const [{ data: products }, { data: ingredients }] = await Promise.all([
    admin
      .from("products")
      .select("id, name, brand, category, image_url")
      .in("id", productIds),
    admin
      .from("product_active_ingredients")
      .select("product_id, ingredient_key")
      .in("product_id", productIds),
  ]);

  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const ingredientsMap = new Map<string, string[]>();
  for (const row of ingredients ?? []) {
    const list = ingredientsMap.get(row.product_id) ?? [];
    list.push(row.ingredient_key);
    ingredientsMap.set(row.product_id, list);
  }

  return links.flatMap((row) => {
    const product = productMap.get(row.product_id);
    if (!product) return [];
    return [
      {
        id: row.id,
        productId: row.product_id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        imageUrl: product.image_url,
        ingredients: ingredientsMap.get(row.product_id) ?? [],
      },
    ];
  });
}

async function syncIngredients(productId: string, ingredients: string[]) {
  const admin = createAdminClient();
  const unique = [...new Set(ingredients.filter(Boolean))];

  const { data: current } = await admin
    .from("product_active_ingredients")
    .select("ingredient_key")
    .eq("product_id", productId);

  if ((current?.length ?? 0) > 0 && unique.length === 0) {
    return;
  }

  if ((current?.length ?? 0) === 0 && unique.length > 0) {
    await admin.from("product_active_ingredients").insert(
      unique.map((ingredient_key) => ({ product_id: productId, ingredient_key })),
    );
  }
}

async function uploadProductImage(
  userId: string,
  productId: string,
  dataUrl: string,
  mime: string,
) {
  const admin = createAdminClient();
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > 4 * 1024 * 1024) {
    return null;
  }
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const path = `${userId}/${productId}.${ext}`;
  const { error } = await admin.storage.from("product-images").upload(path, bytes, {
    contentType: mime || "image/jpeg",
    upsert: true,
  });
  if (error) {
    return null;
  }
  const { data } = admin.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
