import type { ProductCategory } from "@/types/database";
import type { AppLocale } from "@/types/database";

export const PRODUCT_CATEGORIES: { value: ProductCategory; labelEs: string; labelEn: string }[] = [
  { value: "cleanser", labelEs: "Limpiador", labelEn: "Cleanser" },
  { value: "toner", labelEs: "Tónico", labelEn: "Toner" },
  { value: "essence", labelEs: "Esencia", labelEn: "Essence" },
  { value: "serum", labelEs: "Sérum", labelEn: "Serum" },
  { value: "treatment", labelEs: "Tratamiento", labelEn: "Treatment" },
  { value: "moisturizer", labelEs: "Hidratante", labelEn: "Moisturizer" },
  { value: "oil", labelEs: "Aceite / oclusivo", labelEn: "Oil / occlusive" },
  { value: "sunscreen", labelEs: "Protector solar", labelEn: "Sunscreen" },
  { value: "mask", labelEs: "Mascarilla", labelEn: "Mask" },
  { value: "exfoliant", labelEs: "Exfoliante", labelEn: "Exfoliant" },
  { value: "eye_cream", labelEs: "Contorno de ojos", labelEn: "Eye cream" },
  { value: "other", labelEs: "Otro", labelEn: "Other" },
];

export function categoryLabel(category: ProductCategory, locale: AppLocale = "es") {
  const item = PRODUCT_CATEGORIES.find((row) => row.value === category);
  if (!item) return category;
  return locale === "en" ? item.labelEn : item.labelEs;
}
