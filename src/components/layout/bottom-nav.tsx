"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAV_ITEMS } from "@/lib/nav";
import type { AppLocale } from "@/types/database";

export function BottomNav({ locale }: { locale: AppLocale }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid h-16 grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] ${
                  active ? "font-medium text-foreground" : "text-foreground/50"
                }`}
              >
                <Icon size={20} />
                {locale === "en" ? item.labelEn : item.labelEs}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
