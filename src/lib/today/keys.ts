import type { TimeOfDay } from "@/types/database";

export function logKey(timeOfDay: TimeOfDay, productId: string) {
  return `${timeOfDay}:${productId}`;
}

export function todayStamp() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}
