import { StockItem } from "@/types/stock";

type ProcedureLine = { itemId: string; itemName: string; quantity: number };
export type ProcedurePack = {
  id: string;
  name: string;
  lines: ProcedureLine[];
  createdAt: string;
};

/** Pack blueprints: item name (matched loosely against inventory) + quantity */
const BLUEPRINTS: { name: string; items: [string, number][] }[] = [
  { name: "Wound Dressing", items: [["Sterile Gauze Pads", 4], ["Disposable Gloves (M)", 2], ["Surgical Scissors Set", 1]] },
  { name: "Minor Suture", items: [["Surgical Scissors Set", 1], ["Sterile Gauze Pads", 3], ["Disposable Gloves (M)", 2]] },
  { name: "Vaccination – Influenza", items: [["Influenza Vaccine 2024", 1], ["Disposable Gloves (M)", 1], ["Sterile Gauze Pads", 1]] },
  { name: "Vaccination – Hepatitis B", items: [["Hepatitis B Vaccine", 1], ["Disposable Gloves (M)", 1]] },
  { name: "COVID-19 Booster Clinic", items: [["COVID-19 Booster", 1], ["Disposable Gloves (M)", 1], ["Sterile Gauze Pads", 1]] },
  { name: "Asthma / Nebuliser Review", items: [["Salbutamol Nebules", 2], ["Pulse Oximeter", 1], ["Spirometer", 1]] },
  { name: "Anaphylaxis Response", items: [["Adrenaline 1:1000", 2], ["Disposable Gloves (M)", 2], ["Pulse Oximeter", 1]] },
  { name: "Cardiac Assessment (ECG)", items: [["ECG Machine", 1], ["Sphygmomanometer", 1], ["Diagnostic Thermometer", 1]] },
  { name: "General Health Check", items: [["Sphygmomanometer", 1], ["Diagnostic Thermometer", 1], ["Otoscope", 1], ["Portable Glucometer", 1]] },
  { name: "Ear & Eye Examination", items: [["Otoscope", 1], ["Ophthalmoscope", 1], ["Disposable Gloves (M)", 1]] },
];

/** Build mock packs from the current inventory, skipping items that don't exist. */
export function buildMockProcedurePacks(items: StockItem[]): ProcedurePack[] {
  const findItem = (name: string) =>
    items.find((i) => i.name?.trim().toLowerCase() === name.trim().toLowerCase());

  const now = Date.now();
  return BLUEPRINTS.map((bp, idx) => {
    const lines = bp.items
      .map(([name, quantity]) => {
        const found = findItem(name);
        return found ? { itemId: found.id, itemName: found.name, quantity } : null;
      })
      .filter(Boolean) as ProcedureLine[];
    return {
      id: `mock-pack-${idx + 1}`,
      name: bp.name,
      lines,
      createdAt: new Date(now - idx * 86400000).toISOString(),
    };
  }).filter((p) => p.lines.length > 0);
}
