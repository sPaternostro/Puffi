"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (link.target === "_blank") return;
      if (href === pathname || href.split("?")[0] === pathname) return;
      setActive(true);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  useEffect(() => {
    setActive(false);
  }, [pathname]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!active}
    >
      <div className={`h-full bg-primary-strong ${active ? "animate-progress" : "w-0"}`} />
    </div>
  );
}
