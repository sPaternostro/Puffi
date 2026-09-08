import type { ConflictSeverity, ProductCategory, SkinGoal } from "@/types/database";
import type { ShelfProduct } from "@/lib/products/actions";

const AM_ORDER: ProductCategory[] = [
  "cleanser",
  "toner",
  "essence",
  "serum",
  "treatment",
  "exfoliant",
  "eye_cream",
  "moisturizer",
  "sunscreen",
  "mask",
  "other",
];

const PM_ORDER: ProductCategory[] = [
  "cleanser",
  "toner",
  "essence",
  "serum",
  "treatment",
  "exfoliant",
  "eye_cream",
  "moisturizer",
  "oil",
  "mask",
  "other",
];

export type RoutineWarning = {
  severity: ConflictSeverity;
  ingredientA: string;
  ingredientB: string;
  productNames: string[];
  explanation: string;
};

export type RoutineSuggestion = {
  id: string;
  title: string;
  detail: string;
  searchQuery: string | null;
};

export type GeneratedRoutine = {
  am: ShelfProduct[];
  pm: ShelfProduct[];
  warnings: RoutineWarning[];
  suggestions: RoutineSuggestion[];
};

type ConflictRow = {
  ingredient_a: string;
  ingredient_b: string;
  severity: ConflictSeverity;
  explanation_es: string;
  explanation_en: string;
};

export function generateRoutine(
  products: ShelfProduct[],
  conflicts: ConflictRow[],
  goal: SkinGoal | null,
  locale: "es" | "en" = "es",
): GeneratedRoutine {
  const amPool = products.filter((product) => product.category !== "oil");
  const pmPool = products.filter((product) => product.category !== "sunscreen");

  const am = sortBy(amPool, AM_ORDER);
  const pm = sortBy(pmPool, PM_ORDER);
  const warnings = findWarnings(products, conflicts, locale);

  return {
    am,
    pm,
    warnings,
    suggestions: suggestGaps(products, goal, locale),
  };
}

function sortBy(products: ShelfProduct[], order: ProductCategory[]) {
  return [...products].sort((a, b) => {
    const ai = order.indexOf(a.category);
    const bi = order.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function findWarnings(
  products: ShelfProduct[],
  conflicts: ConflictRow[],
  locale: "es" | "en",
): RoutineWarning[] {
  const warnings: RoutineWarning[] = [];
  for (let i = 0; i < products.length; i += 1) {
    for (let j = i + 1; j < products.length; j += 1) {
      const left = products[i];
      const right = products[j];
      for (const a of left.ingredients) {
        for (const b of right.ingredients) {
          const [ingredientA, ingredientB] = a < b ? [a, b] : [b, a];
          const match = conflicts.find(
            (row) => row.ingredient_a === ingredientA && row.ingredient_b === ingredientB,
          );
          if (!match) continue;
          if (
            warnings.some(
              (item) =>
                item.ingredientA === match.ingredient_a && item.ingredientB === match.ingredient_b,
            )
          ) {
            continue;
          }
          warnings.push({
            severity: match.severity,
            ingredientA: match.ingredient_a,
            ingredientB: match.ingredient_b,
            productNames: [left.name, right.name],
            explanation: locale === "en" ? match.explanation_en : match.explanation_es,
          });
        }
      }
    }
  }
  return warnings;
}

function copy(locale: "es" | "en", es: string, en: string) {
  return locale === "en" ? en : es;
}

function suggestGaps(
  products: ShelfProduct[],
  goal: SkinGoal | null,
  locale: "es" | "en",
): RoutineSuggestion[] {
  const cats = new Set(products.map((product) => product.category));
  const tips: RoutineSuggestion[] = [];
  if (!cats.has("cleanser")) {
    tips.push({
      id: "cleanser",
      title: copy(locale, "Limpiador", "Cleanser"),
      detail: copy(locale, "Para empezar la rutina de mañana y noche.", "To start morning and night."),
      searchQuery: copy(locale, "limpiador", "cleanser"),
    });
  }
  if (!cats.has("moisturizer")) {
    tips.push({
      id: "moisturizer",
      title: copy(locale, "Hidratante", "Moisturizer"),
      detail: copy(
        locale,
        "Para sellar lo que ya usás, de día y de noche.",
        "To seal in what you already use, day and night.",
      ),
      searchQuery: copy(locale, "hidratante", "moisturizer"),
    });
  }
  if (!cats.has("sunscreen")) {
    tips.push({
      id: "sunscreen",
      title: copy(locale, "Protector solar", "Sunscreen"),
      detail: copy(
        locale,
        "Para la mañana. Cualquier FPS que te guste está bien.",
        "For the morning. Any SPF you like is fine.",
      ),
      searchQuery: copy(locale, "protector solar", "sunscreen"),
    });
  }
  if (goal === "acne" && !cats.has("treatment") && !products.some((p) => p.ingredients.includes("bha") || p.ingredients.includes("benzoyl_peroxide"))) {
    tips.push({
      id: "treatment",
      title: copy(locale, "Tratamiento", "Treatment"),
      detail: copy(
        locale,
        "Si tu objetivo es acné, más adelante un sérum o tónico con BHA.",
        "If acne is your goal, a BHA serum or toner later on.",
      ),
      searchQuery: copy(locale, "serum BHA", "BHA serum"),
    });
  }
  if (goal === "anti_aging" && !products.some((p) => p.ingredients.includes("retinol"))) {
    tips.push({
      id: "serum-night",
      title: copy(locale, "Sérum de noche", "Night serum"),
      detail: copy(
        locale,
        "Para anti-edad, más adelante uno con retinol. Usalo de noche.",
        "For anti-aging, a retinol serum at night.",
      ),
      searchQuery: copy(locale, "serum retinol", "retinol serum"),
    });
  }
  if (goal === "dark_spots" && !products.some((p) => p.ingredients.includes("vitamin_c"))) {
    tips.push({
      id: "serum-day",
      title: copy(locale, "Sérum de día", "Day serum"),
      detail: copy(
        locale,
        "Para manchas, más adelante uno con vitamina C.",
        "For dark spots, a vitamin C serum later on.",
      ),
      searchQuery: copy(locale, "serum vitamina C", "vitamin C serum"),
    });
  }
  if (goal === "hydration" && !cats.has("serum")) {
    tips.push({
      id: "serum",
      title: copy(locale, "Sérum hidratante", "Hydrating serum"),
      detail: copy(
        locale,
        "Un extra de hidratación, debajo de la crema o solo.",
        "Extra hydration, under cream or on its own.",
      ),
      searchQuery: copy(locale, "serum hidratante", "hydrating serum"),
    });
  }
  if (goal === "sensitive" && cats.has("exfoliant")) {
    tips.push({
      id: "caution",
      title: copy(locale, "Ir suave", "Go gentle"),
      detail: copy(
        locale,
        "Con piel sensible, conviene no apilar varios exfoliantes.",
        "With sensitive skin, skip stacking several exfoliants.",
      ),
      searchQuery: null,
    });
  }
  return tips;
}
