import type { AppLocale } from "@/types/database";

export function guideSteps(locale: AppLocale) {
  if (locale === "en") {
    return [
      {
        title: "Products",
        body: "Add what you already have or want to buy, to see how it fits. Scan, search by brand, or enter it by hand.",
      },
      {
        title: "Routine",
        body: "One product is enough to generate morning and night order, plus notes if two actives don’t mix well.",
      },
      {
        title: "Today",
        body: "Daily checklist. Once you have a routine, this is where the day starts.",
      },
      {
        title: "Account",
        body: "Plan, how it works, legal notice, and log out.",
      },
    ] as const;
  }
  return [
    {
      title: "Productos",
      body: "Cargá lo que ya tenés o lo que querés comprar, para ver cómo combina. Escaneá, buscá por marca o ingresalo a mano.",
    },
    {
      title: "Rutina",
      body: "Con 1 producto ya podés generar el orden de mañana y noche, y los avisos si dos activos no combinan bien.",
    },
    {
      title: "Hoy",
      body: "Checklist diario. Cuando ya tenés rutina, acá empieza el día.",
    },
    {
      title: "Cuenta",
      body: "Plan, cómo se usa, aviso legal y cerrar sesión.",
    },
  ] as const;
}

export const WELCOME_STORAGE_KEY = "puffi-welcome-at";
export const WELCOME_REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 30;
