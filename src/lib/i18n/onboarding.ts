import type { AppLocale, SkinGoal, SkinType } from "@/types/database";

export function onboardingCopy(locale: AppLocale) {
  if (locale === "en") {
    return {
      productsTitle: "First, your products",
      productsBody1:
        "Add what you already have in the bathroom (or what you’re about to buy, to see if it fits). Puffi sorts morning and night and warns if two actives shouldn’t be used together. 1 product is enough to generate a routine; 2 or 3 make it more useful. You don’t need 8.",
      productsBody2: "Later we’ll suggest what you’re missing for your goal, for example a serum.",
      legalLead: "I understand that Puffi does not replace a doctor.",
      continue: "Continue",
      back: "Back",
      skip: "Skip",
      goalsTitle: "What would you like to improve or care for?",
      goalsHint: "Optional. You can pick more than one. This is not a diagnosis: it helps prioritize the routine.",
      typesTitle: "How would you describe your skin?",
      typesHint: "Optional. Pick one. If you’re not sure, use “I don’t know”.",
      hideGuide: "Hide guide",
      showGuide: "How to tell them apart",
      unsure: "I don’t know",
      goToProducts: "Go to my products",
      goals: [
        { value: "acne" as SkinGoal, label: "Treat or prevent acne", hint: "Breakouts, blackheads, uneven texture" },
        { value: "anti_aging" as SkinGoal, label: "Anti-aging care", hint: "Firmness, lines, prevention" },
        { value: "dark_spots" as SkinGoal, label: "Fade dark spots", hint: "Sun spots, acne marks" },
        { value: "hydration" as SkinGoal, label: "More hydration", hint: "Tightness, dryness" },
        { value: "sensitive" as SkinGoal, label: "Calm sensitive skin", hint: "Redness, itch, reactivity" },
      ],
      types: [
        { value: "dry" as SkinType, label: "Dry" },
        { value: "oily" as SkinType, label: "Oily" },
        { value: "combination" as SkinType, label: "Combination" },
        { value: "normal" as SkinType, label: "Normal" },
        { value: "sensitive" as SkinType, label: "Sensitive" },
      ],
      guide: [
        { name: "Dry", body: "feels tight, looks dull, sometimes flakes." },
        { name: "Oily", body: "shine on almost the whole face, more visible pores." },
        { name: "Combination", body: "T-zone (forehead, nose, chin) oilier; cheeks more normal or dry." },
        { name: "Normal", body: "comfortable most of the day, no extremes." },
        { name: "Sensitive", body: "reddens or itches easily with new products." },
      ],
    };
  }

  return {
    productsTitle: "Primero, tus productos",
    productsBody1:
      "Cargá lo que ya tenés en el baño (o lo que estás por comprar, para ver si combina). Puffi ordena mañana y noche y avisa si hay activos que no deberían usarse juntos. Con 1 producto ya podés generar una rutina; con 2 o 3 se vuelve más útil. No hace falta llegar a 8.",
    productsBody2: "Más adelante te vamos a sugerir qué te falta según tu objetivo, por ejemplo un sérum.",
    legalLead: "Entiendo que Puffi no reemplaza a un médico.",
    continue: "Continuar",
    back: "Atrás",
    skip: "Saltar",
    goalsTitle: "¿Qué te gustaría mejorar o cuidar?",
    goalsHint: "Opcional. Podés marcar más de una. No es un diagnóstico: es para priorizar la rutina.",
    typesTitle: "¿Cómo describirías tu piel?",
    typesHint: "Opcional. Elegí una. Si no estás segura, usá «No sé».",
    hideGuide: "Ocultar guía",
    showGuide: "Cómo distinguirlo",
    unsure: "No sé",
    goToProducts: "Ir a mis productos",
    goals: [
      { value: "acne" as SkinGoal, label: "Tratar o prevenir acné", hint: "Brotes, puntos negros, textura irregular" },
      { value: "anti_aging" as SkinGoal, label: "Cuidado anti-edad", hint: "Firmeza, líneas, prevención" },
      { value: "dark_spots" as SkinGoal, label: "Atenuación de manchas", hint: "Manchas de sol, marcas de acné" },
      { value: "hydration" as SkinGoal, label: "Más hidratación", hint: "Tirantez, sequedad" },
      { value: "sensitive" as SkinGoal, label: "Calmar piel sensible", hint: "Rojez, picazón, reactividad" },
    ],
    types: [
      { value: "dry" as SkinType, label: "Seca" },
      { value: "oily" as SkinType, label: "Grasa" },
      { value: "combination" as SkinType, label: "Mixta" },
      { value: "normal" as SkinType, label: "Normal" },
      { value: "sensitive" as SkinType, label: "Sensible" },
    ],
    guide: [
      { name: "Seca", body: "tira, se ve opaca, a veces descama." },
      { name: "Grasa", body: "brillo en casi toda la cara, poros más visibles." },
      { name: "Mixta", body: "zona T (frente, nariz, mentón) más grasa; mejillas más normales o secas." },
      { name: "Normal", body: "cómoda la mayor parte del día, sin extremos." },
      { name: "Sensible", body: "se enrojece o pica fácil con productos nuevos." },
    ],
  };
}
