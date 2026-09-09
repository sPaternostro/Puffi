"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAV_ITEMS } from "@/lib/nav";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ProBadge } from "@/components/layout/pro-badge";
import type { AppLocale } from "@/types/database";

export function SiteHeader({ locale, isPro }: { locale: AppLocale; isPro: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-card/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
          Puffi
          {isPro ? <ProBadge /> : null}
        </Link>
        <div className="flex items-center gap-3">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-accent/80 font-medium" : "text-foreground/70 hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {locale === "en" ? item.labelEn : item.labelEs}
              </Link>
            );
          })}
        </nav>
        <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
