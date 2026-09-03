import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import inventoryShot from "@/assets/training-screenshots/inventory.png";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const INVENTORY_PRACTICE_TIP: TipConfig = {
  about:
    "Inventory is the consolidated view of everything your practice owns or stocks — consumables, stationery, devices and anything else. Use it to search across all categories at once, audit what you have on hand, and quickly upload invoices or stock lists for AI to extract into structured items.",
  howToUse: [
    "Drop an invoice or stock list into the AI upload zone to extract items automatically.",
    "Filter by category (All, Consumable, Stationery, Device, Other) using the segmented control.",
    "Search by name, batch, location or invoice number to find any item fast.",
  ],
  topic: {
    id: "inventory-overview",
    title: "Inventory",
    summary: "One consolidated view of every item your practice stocks — searchable, filterable and AI-importable.",
    videoDuration: "2:30",
    screenshotUrl: inventoryShot,
    steps: [
      {
        step: 1,
        title: "AI Scan an invoice or stock list",
        description: "Drop a PDF or photo into the upload zone. AI extracts item name, quantity, batch, expiry and invoice details into structured rows for you to review.",
        screenshotCaption: "AI upload zone",
        annotations: [{ type: "arrow", top: 14, left: 25, width: 30, rotation: 0, label: "Drop file" }],
      },
      {
        step: 2,
        title: "Filter by category",
        description: "Use the segmented control to narrow the list to Consumable, Stationery, Device or Other. Badges show the count per category.",
        screenshotCaption: "Category filters",
        annotations: [{ type: "circle", top: 30, left: 30, width: 50, height: 12, label: "Categories" }],
      },
      {
        step: 3,
        title: "Search across everything",
        description: "Search works across item name, description, batch number, invoice number and location — useful for stocktakes and audits.",
        screenshotCaption: "Search bar",
        annotations: [{ type: "arrow", top: 22, left: 8, width: 22, rotation: 0, label: "Search" }],
      },
    ],
  },
};
