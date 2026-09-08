import type { AppLocale } from "@/types/database";

export const INGREDIENT_OPTIONS = [
  { key: "retinol", labelEs: "Retinol / retinoides", labelEn: "Retinol / retinoids" },
  { key: "vitamin_c", labelEs: "Vitamina C", labelEn: "Vitamin C" },
  { key: "niacinamide", labelEs: "Niacinamida", labelEn: "Niacinamide" },
  { key: "aha", labelEs: "AHA (glicólico, láctico, mandélico)", labelEn: "AHA (glycolic, lactic, mandelic)" },
  { key: "bha", labelEs: "BHA (ácido salicílico)", labelEn: "BHA (salicylic acid)" },
  { key: "benzoyl_peroxide", labelEs: "Peróxido de benzoilo", labelEn: "Benzoyl peroxide" },
  { key: "spf", labelEs: "Protector solar (SPF)", labelEn: "Sunscreen (SPF)" },
] as const;

export type KnownIngredientKey = (typeof INGREDIENT_OPTIONS)[number]["key"];

const PATTERNS: { key: KnownIngredientKey; tests: RegExp[] }[] = [
  { key: "retinol", tests: [/retinol/i, /retinal/i, /tretinoin/i, /retinoid/i, /adapalene/i] },
  {
    key: "vitamin_c",
    tests: [/ascorbic/i, /ascorbyl/i, /vitamin(?:a|e)?\s*c/i, /vitamina\s*c/i],
  },
  { key: "niacinamide", tests: [/niacinamide/i, /nicotinamide/i, /niacinamida/i] },
  {
    key: "aha",
    tests: [
      /\baha\b/i,
      /glycolic/i, /glicolic/i,
      /lactic acid/i, /acido lactico/i, /ácido láctico/i,
      /mandelic/i, /mandelico/i,
      /malic acid/i,
      /tartaric/i,
    ],
  },
  {
    key: "bha",
    tests: [/\bbha\b/i, /salicylic/i, /salicil/i, /betaine salicylate/i],
  },
  {
    key: "benzoyl_peroxide",
    tests: [/benzoyl peroxide/i, /peroxido de benzoilo/i, /peróxido de benzoilo/i],
  },
  {
    key: "spf",
    tests: [/\bspf\b/i, /sunscreen/i, /protector solar/i, /zinc oxide/i, /titanium dioxide/i],
  },
];

export function detectIngredients(text: string | null | undefined): KnownIngredientKey[] {
  if (!text) return [];
  const found = new Set<KnownIngredientKey>();
  for (const { key, tests } of PATTERNS) {
    if (tests.some((test) => test.test(text))) {
      found.add(key);
    }
  }
  return [...found];
}

export function ingredientLabel(key: string, locale: AppLocale = "es") {
  const item = INGREDIENT_OPTIONS.find((row) => row.key === key);
  if (!item) return key;
  return locale === "en" ? item.labelEn : item.labelEs;
}
