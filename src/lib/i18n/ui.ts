import type { AppLocale } from "@/types/database";

const es = {
  routine: "Rutina",
  products: "Productos",
  today: "Hoy",
  account: "Cuenta",
  morning: "Mañana",
  night: "Noche",
  generateRoutine: "Generar rutina",
  updateRoutine: "Actualizar rutina",
  loadProducts: "Cargar productos",
  addProduct: "Agregar producto",
  search: "Buscar",
  back: "Volver",
  legal: "Aviso legal",
  language: "Idioma",
  signOut: "Cerrar sesión",
  shelfChanged: "La estantería cambió",
  shelfChangedHint:
    "Hay productos nuevos o que quitaste. Actualizá el orden de mañana y noche.",
  completeIfYouWant: "Para completar, si querés",
  compatibility: "Avisos de compatibilidad",
  avoidTogether: "mejor no juntos",
  withCare: "con cuidado",
  nothingForThisTime: "Nada para este momento del día.",
  noProductsYet: "Todavía no hay productos",
  noProductsHint:
    "Cargá al menos {min} (el que ya usás o el que querés comprar). Después volvé acá y tocá Generar rutina.",
  readyAmPm: "Listo para armar mañana y noche",
  readyAmPmHint: "Ya tenés {count} producto{s}. Generá la rutina cuando quieras.",
  routineOrderHint: "El orden de mañana y noche, según lo que cargaste.",
  routineMinHint:
    "Con {min} producto ya alcanza. Tenés {count}. Con 2 o 3 el AM/PM queda más completo; no hace falta llegar a 8.",
  unnamedProduct: "Producto sin nombre",
  changingLanguage: "Cambiando idioma…",
  searchFor: "Buscar {name}",
  howToUse: "Cómo se usa",
  todayChecklistOf: "Tu checklist de {date}.",
  todayIntro: "Acá tildás lo que ya usaste. Sale de tu rutina y se reinicia cada día.",
  noRoutineToday: "Todavía no hay una rutina para tildar",
  noRoutineTodayHint: "Generala en Rutina (con al menos un producto) y este listado se arma solo.",
  goToRoutine: "Ir a rutina",
  resetsTomorrow: "se reinicia mañana",
  of: "de",
  emptyShelfHint: "Escaneá, buscá por marca o cargá a mano. Después generá el orden de mañana y noche.",
  emptyShelfLead:
    "Cargá lo que ya tenés (o lo que querés comprar). Con 1 producto ya podés generar la rutina. El plan free permite hasta 8.",
  shelfCount: "{count} producto{s} · máximo {max} en plan free.",
  addProductHint:
    "Escaneá, buscá por marca o cargalo a mano. Si el catálogo trae foto, se completa sola.",
  noBrand: "Sin marca",
  loading: "Cargando…",
  nothingForThisMoment: "Nada para este momento.",
  howToUseIntro: "Cargá productos, generá la rutina y tildá el día. Nada más.",
  welcomeTitle: "Así se usa Puffi",
  welcomeLead: "Un vistazo rápido. Después lo encontrás en Cuenta, si lo necesitás.",
  gotIt: "Entendido",
  detectedActives: "Activos detectados",
  signingOut: "Cerrando sesión…",
  searchingProducts: "Buscando productos…",
  lookingUpProduct: "Buscando el producto…",
  openingCamera: "Abriendo cámara…",
  saving: "Guardando…",
};

const en = {
  routine: "Routine",
  products: "Products",
  today: "Today",
  account: "Account",
  morning: "Morning",
  night: "Night",
  generateRoutine: "Generate routine",
  updateRoutine: "Update routine",
  loadProducts: "Add products",
  addProduct: "Add product",
  search: "Search",
  back: "Back",
  legal: "Legal notice",
  language: "Language",
  signOut: "Log out",
  shelfChanged: "Your shelf changed",
  shelfChangedHint: "You added or removed products. Update the morning and night order.",
  completeIfYouWant: "To round it out, if you want",
  compatibility: "Compatibility notes",
  avoidTogether: "better not together",
  withCare: "use with care",
  nothingForThisTime: "Nothing for this time of day.",
  noProductsYet: "No products yet",
  noProductsHint:
    "Add at least {min} (one you use or want to buy). Then come back and generate the routine.",
  readyAmPm: "Ready to set morning and night",
  readyAmPmHint: "You have {count} product{s}. Generate the routine whenever you like.",
  routineOrderHint: "Morning and night order, based on what you added.",
  routineMinHint:
    "{min} product is enough. You have {count}. With 2 or 3, AM/PM feels more complete; you don’t need 8.",
  unnamedProduct: "Unnamed product",
  changingLanguage: "Switching language…",
  searchFor: "Search {name}",
  howToUse: "How it works",
  todayChecklistOf: "Your checklist for {date}.",
  todayIntro: "Check off what you already used. It comes from your routine and resets every day.",
  noRoutineToday: "No routine to check off yet",
  noRoutineTodayHint: "Generate it in Routine (at least one product) and this list fills in.",
  goToRoutine: "Go to routine",
  resetsTomorrow: "resets tomorrow",
  of: "of",
  emptyShelfHint: "Scan, search by brand, or add by hand. Then generate morning and night order.",
  emptyShelfLead:
    "Add what you already have (or want to buy). 1 product is enough to generate a routine. Free plan allows up to 8.",
  shelfCount: "{count} product{s} · max {max} on the free plan.",
  addProductHint: "Scan, search by brand, or add by hand. If the catalog has a photo, it fills in.",
  noBrand: "No brand",
  loading: "Loading…",
  nothingForThisMoment: "Nothing for this time of day.",
  howToUseIntro: "Add products, generate the routine, check off the day. That’s it.",
  welcomeTitle: "How Puffi works",
  welcomeLead: "A quick look. You’ll find this again in Account if you need it.",
  gotIt: "Got it",
  detectedActives: "Actives found",
  signingOut: "Signing out…",
  searchingProducts: "Searching products…",
  lookingUpProduct: "Looking up the product…",
  openingCamera: "Opening camera…",
  saving: "Saving…",
};

export type UiCopy = typeof es;

export function ui(locale: AppLocale): UiCopy {
  return locale === "en" ? en : es;
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

const UNNAMED = new Set(["Producto sin nombre", "Unnamed product"]);

export function displayProductName(name: string, locale: AppLocale) {
  return UNNAMED.has(name) ? ui(locale).unnamedProduct : name;
}
