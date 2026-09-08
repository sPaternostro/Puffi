import type { ProductCategory } from "@/types/database";

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "cleanser", label: "Limpiador" },
  { value: "toner", label: "Tónico" },
  { value: "essence", label: "Esencia" },
  { value: "serum", label: "Sérum" },
  { value: "treatment", label: "Tratamiento" },
  { value: "moisturizer", label: "Hidratante" },
  { value: "oil", label: "Aceite / oclusivo" },
  { value: "sunscreen", label: "Protector solar" },
  { value: "mask", label: "Mascarilla" },
  { value: "exfoliant", label: "Exfoliante" },
  { value: "eye_cream", label: "Contorno de ojos" },
  { value: "other", label: "Otro" },
];

export function categoryLabel(category: ProductCategory) {
  return PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
