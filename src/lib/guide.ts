export const GUIDE_STEPS = [
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

export const WELCOME_STORAGE_KEY = "puffi-welcome-at";
export const WELCOME_REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 30;
