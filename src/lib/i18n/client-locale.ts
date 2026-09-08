"use client";

import { useSyncExternalStore } from "react";
import type { AppLocale } from "@/types/database";

function readClientLocale(): AppLocale {
  if (typeof document === "undefined") return "es";
  if (document.documentElement.lang === "en" || document.documentElement.lang === "es") {
    return document.documentElement.lang;
  }
  const match = document.cookie.match(/(?:^|; )puffi-locale=(en|es)/);
  return match?.[1] === "en" ? "en" : "es";
}

export function useClientLocale(): AppLocale {
  return useSyncExternalStore(
    () => () => {},
    readClientLocale,
    () => "es",
  );
}
