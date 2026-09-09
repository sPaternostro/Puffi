import type { AppLocale } from "@/types/database";
import { FREE_PRODUCT_LIMIT } from "@/lib/plans";

export function planCopy(locale: AppLocale) {
  if (locale === "en") {
    return {
      title: "Plans",
      current: "Current plan",
      freeName: "Free",
      proName: "Pro",
      freeLead: `Up to ${FREE_PRODUCT_LIMIT} products. Enough for a real AM/PM without filling the shelf with everything you own.`,
      freeItems: [
        "Morning and night order",
        "Compatibility notes between actives",
        "Today checklist and reminders",
        `${FREE_PRODUCT_LIMIT} products on your shelf`,
        "One saved routine",
      ],
      proLead:
        "For a full bathroom — what you use, rotate, and want to buy — without deleting something to add something new.",
      proItems: [
        "Unlimited products on your shelf",
        "Several named routines (home, travel…)",
        "Keep travel minis, backups, and “maybe later” bottles",
        "Same order, warnings, Today, and reminders — with room to grow",
      ],
      upgrade: "Go Pro",
      comingSoon: "Checkout isn’t live yet. When Puffi launches, this button will take you to pay.",
      youHaveThis: "This is your plan",
    };
  }
  return {
    title: "Planes",
    current: "Plan actual",
    freeName: "Free",
    proName: "Pro",
    freeLead: `Hasta ${FREE_PRODUCT_LIMIT} productos. Alcanza para un AM/PM real, sin cargar todo el placard.`,
    freeItems: [
      "Orden de mañana y noche",
      "Avisos si dos activos no combinan",
      "Checklist de Hoy y recordatorios",
      `${FREE_PRODUCT_LIMIT} productos en la estantería`,
      "Una rutina guardada",
    ],
    proLead:
      "Para el baño completo: lo que usás, lo que rotás y lo que querés comprar, sin tener que borrar uno para cargar otro.",
    proItems: [
      "Productos ilimitados en la estantería",
      "Varias rutinas con nombre (casa, vacaciones…)",
      "Minis de viaje, backups y los que “más adelante”",
      "El mismo orden, avisos, Hoy y recordatorios, con lugar para crecer",
    ],
    upgrade: "Pasarme a Pro",
    comingSoon: "El pago todavía no está activo. Cuando Puffi esté en línea, este botón te lleva a pagar.",
    youHaveThis: "Este es tu plan",
  };
}
