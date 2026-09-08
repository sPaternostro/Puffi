export const LEGAL_SHORT_ES =
  "Puffi es una guía informativa. No reemplaza el consejo de un médico o dermatólogo. Los datos de productos provienen de fuentes públicas y de lo que cargás vos, y pueden estar incompletos.";

export const LEGAL_SHORT_EN =
  "Puffi is an informational guide. It does not replace advice from a doctor or dermatologist. Product data comes from public sources and from what you enter, and it may be incomplete.";

export const LEGAL_SHORT = LEGAL_SHORT_ES;

export const LEGAL_SECTIONS_ES = [
  {
    title: "No es consejo médico",
    body: "Puffi no diagnostica, no trata ni prescribe. Las rutinas y avisos de incompatibilidad son orientativos, basados en reglas generales de skincare. Si tenés una condición de piel, estás embarazada, en tratamiento o tu piel reacciona, consultá a un profesional de la salud.",
  },
  {
    title: "De dónde salen los datos",
    body: "Los productos y algunos ingredientes se consultan en bases públicas, principalmente Open Beauty Facts, o los ingresás a mano. Esa información puede estar desactualizada, incompleta o mal catalogada. Siempre conviene contrastar con el envase.",
  },
  {
    title: "Incompatibilidades",
    body: "Los conflictos entre activos (por ejemplo retinol y peróxido de benzoilo) se basan en bibliografía y práctica habitual, no en un análisis de laboratorio de tu fórmula exacta. Concentración, pH y el resto de la fórmula importan.",
  },
  {
    title: "Responsabilidad",
    body: "Usás Puffi bajo tu propio criterio. No nos hacemos responsables por irritaciones, alergias u otras consecuencias de seguir una rutina sugerida por la app.",
  },
];

export const LEGAL_SECTIONS_EN = [
  {
    title: "Not medical advice",
    body: "Puffi does not diagnose, treat, or prescribe. Routines and incompatibility warnings are guidance based on general skincare rules. If you have a skin condition, are pregnant, in treatment, or your skin reacts, see a health professional.",
  },
  {
    title: "Where the data comes from",
    body: "Products and some ingredients come from public databases, mainly Open Beauty Facts, or from what you enter by hand. That information can be outdated, incomplete, or miscategorized. Always check the packaging.",
  },
  {
    title: "Incompatibilities",
    body: "Conflicts between actives (for example retinol and benzoyl peroxide) are based on literature and common practice, not a lab analysis of your exact formula. Concentration, pH, and the rest of the formula matter.",
  },
  {
    title: "Liability",
    body: "You use Puffi at your own judgment. We are not responsible for irritation, allergies, or other consequences of following a suggested routine.",
  },
];

export const LEGAL_SECTIONS = LEGAL_SECTIONS_ES;

export function legalCopy(locale: "es" | "en") {
  return locale === "en"
    ? { short: LEGAL_SHORT_EN, sections: LEGAL_SECTIONS_EN }
    : { short: LEGAL_SHORT_ES, sections: LEGAL_SECTIONS_ES };
}
