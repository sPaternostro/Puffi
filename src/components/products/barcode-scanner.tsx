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
    let running = false;
    let handedOff = false;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 6,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const width = Math.max(160, Math.min(260, Math.floor(viewfinderWidth * 0.82)));
            const height = Math.max(80, Math.min(130, Math.floor(viewfinderHeight * 0.38)));
            return { width, height };
          },
        },
        (text) => {
          if (handedOff) return;
          const digits = text.replace(/\D/g, "");
          if (digits.length < 8) return;
          handedOff = true;
          onDetectedRef.current(digits);
        },
        () => undefined,
      )
      .then(() => {
        running = true;
      })
      .catch(() => undefined);

    return () => {
      handedOff = true;
      if (!running) return;
      void scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => undefined);
    };
  }, []);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl bg-black">
      <div id="puffi-barcode-reader" className="min-h-44 w-full max-w-full" />
      <p className="bg-black px-3 py-2 text-center text-xs text-white/70">
        Apuntá al código de barras. En el celular suele pedir permiso de cámara.
      </p>
    </div>
  );
}
