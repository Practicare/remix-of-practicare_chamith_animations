import { useEffect, useState } from "react";
import { marketplaceStore } from "@/data/marketplaceStore";
import { MarketplaceListing } from "@/types/marketplace";

/** Re-renders on any marketplace store change. */
export function useMarketplaceVersion() {
  const [, setTick] = useState(0);
  useEffect(() => marketplaceStore.subscribe(() => setTick((t) => t + 1)), []);
}

export function useMarketplaceListings(): MarketplaceListing[] {
  useMarketplaceVersion();
  return marketplaceStore.getListings();
}

export function useMarketplaceSession(): MarketplaceListing | null {
  useMarketplaceVersion();
  const id = marketplaceStore.getSession();
  return id ? marketplaceStore.getListing(id) ?? null : null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
