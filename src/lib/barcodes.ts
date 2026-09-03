import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY = "practicare.barcodeMap.v1";

/** barcode -> stock item id */
export type BarcodeMap = Record<string, string>;

export function loadBarcodeMap(): BarcodeMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BarcodeMap) : {};
  } catch {
    return {};
  }
}

export function saveBarcodeMap(map: BarcodeMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("practicare:barcode-map-changed"));
  } catch {
    /* ignore */
  }
}

/** Reactive access to the saved barcode -> item id map. */
export function useBarcodeMap() {
  const [map, setMap] = useState<BarcodeMap>(() => loadBarcodeMap());

  useEffect(() => {
    const sync = () => setMap(loadBarcodeMap());
    window.addEventListener("practicare:barcode-map-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("practicare:barcode-map-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((next: BarcodeMap) => {
    saveBarcodeMap(next);
    setMap(next);
  }, []);

  return { map, persist };
}

/** Normalise a scanned code (scanners can emit trailing whitespace/returns). */
export function normaliseBarcode(code: string) {
  return code.replace(/\s+/g, "").trim();
}

interface ScannerOptions {
  /** Fired with the complete code once the scanner sends its terminator. */
  onScan: (code: string) => void;
  /** Max ms between keystrokes to still count as scanner input (vs typing). */
  maxKeyInterval?: number;
  /** Minimum length of a valid barcode. */
  minLength?: number;
  enabled?: boolean;
}

/**
 * Captures USB / Bluetooth "keyboard wedge" barcode scanner signals anywhere on
 * the page. Scanners type the code extremely fast and finish with Enter, so we
 * buffer keystrokes and only accept bursts that are faster than human typing.
 */
export function useBarcodeScanner({
  onScan,
  maxKeyInterval = 60,
  minLength = 3,
  enabled = true,
}: ScannerOptions) {
  const bufferRef = useRef("");
  const lastKeyRef = useRef(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const now = Date.now();
      const gap = now - lastKeyRef.current;
      lastKeyRef.current = now;

      if (e.key === "Enter") {
        const code = normaliseBarcode(bufferRef.current);
        bufferRef.current = "";
        setScanning(false);
        if (code.length >= minLength) {
          e.preventDefault();
          setLastScan(code);
          onScanRef.current(code);
        }
        return;
      }

      if (e.key.length !== 1) return;

      // A slow keystroke means a human is typing — restart the buffer.
      if (gap > maxKeyInterval) bufferRef.current = "";
      bufferRef.current += e.key;
      if (bufferRef.current.length > 1) setScanning(true);
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [enabled, maxKeyInterval, minLength]);

  return { lastScan, scanning };
}
