import type { LucideIcon } from "lucide-react";
import { Package, Sparkles, CheckSquare, User } from "lucide-react";

export const NAV_ITEMS: { href: string; labelEs: string; labelEn: string; icon: LucideIcon }[] = [
  { href: "/productos", labelEs: "Productos", labelEn: "Products", icon: Package },
  { href: "/rutina", labelEs: "Rutina", labelEn: "Routine", icon: Sparkles },
  { href: "/hoy", labelEs: "Hoy", labelEn: "Today", icon: CheckSquare },
  { href: "/cuenta", labelEs: "Cuenta", labelEn: "Account", icon: User },
];

export function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
