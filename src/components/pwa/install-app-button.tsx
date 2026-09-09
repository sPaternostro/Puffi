"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { ui } from "@/lib/i18n/ui";
import type { AppLocale } from "@/types/database";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return ios && webkit;
}

export function InstallAppButton({ locale }: { locale: AppLocale }) {
  const t = ui(locale);
  const [installed, setInstalled] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    function onPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }
    setIosHelp(true);
  }

  if (installed) {
    return (
      <p className="text-sm leading-6 text-foreground/65">{t.alreadyInstalled}</p>
    );
  }

  return (
    <div>
      <p className="text-sm leading-6 text-foreground/65">{t.addToHomeHint}</p>
      <button type="button" className="btn-primary mt-3 w-full sm:w-auto" onClick={() => void install()}>
        <Download size={16} />
        {t.addToHome}
      </button>
      {iosHelp ? (
        <p className="mt-3 rounded-xl border border-line bg-background px-3 py-3 text-sm leading-6">
          <span className="font-medium">
            {isIosSafari() ? t.addToHomeIosTitle : t.addToHomeUnsupported}
          </span>
          <span className="mt-1 block">
            {isIosSafari() ? (
              <>
                {t.addToHomeIos} <Share size={14} className="inline align-text-bottom" />
              </>
            ) : (
              t.addToHomeUnsupported
            )}
          </span>
        </p>
      ) : null}
    </div>
  );
}
