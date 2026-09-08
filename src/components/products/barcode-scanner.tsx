"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onDetected: (barcode: string) => void;
};

export function BarcodeScanner({ onDetected }: Props) {
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    const regionId = "puffi-barcode-reader";
    const scanner = new Html5Qrcode(regionId);
    let stopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 140 } },
        (text) => {
          if (stopped) return;
          stopped = true;
          onDetectedRef.current(text);
          void scanner.stop().catch(() => undefined);
        },
        () => undefined,
      )
      .catch(() => undefined);

    return () => {
      stopped = true;
      void scanner.stop().catch(() => undefined);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <div id="puffi-barcode-reader" className="min-h-52 w-full" />
      <p className="bg-black px-3 py-2 text-center text-xs text-white/70">
        Apuntá al código de barras. En el celular suele pedir permiso de cámara.
      </p>
    </div>
  );
}
