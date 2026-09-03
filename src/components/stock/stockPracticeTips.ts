import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import expiringShot from "@/assets/training-screenshots/stock-expiring.png";
import calibratingShot from "@/assets/training-screenshots/stock-calibrating.png";
import electricalShot from "@/assets/training-screenshots/stock-electrical.png";

export type StockTabKey = "expiring" | "calibrating" | "electrical";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const STOCK_PRACTICE_TIPS: Record<StockTabKey, TipConfig> = {
  expiring: {
    about:
      "Expiring Stocks tracks consumables, medications, vaccines and PPE that have a use-by date. Stock is organised into categories you can customise, and the system surfaces items that are expiring soon or already expired so nothing is used past its date.",
    howToUse: [
      "Click a category card to see its items and add new stock with expiry dates.",
      "Use '+ Add Category' to create a new group when you need one.",
      "Watch the badges — they highlight items expiring soon or already expired.",
    ],
    topic: {
      id: "stock-expiring",
      title: "Expiring Stocks",
      summary: "Track use-by dates for medications, consumables, vaccines and PPE.",
      videoDuration: "2:40",
      screenshotUrl: expiringShot,
      steps: [
        {
          step: 1,
          title: "Open a category",
          description: "Click any category card to see its items, add new stock and update expiry dates.",
          screenshotCaption: "Category grid",
          annotations: [{ type: "circle", top: 40, left: 10, width: 24, height: 24, label: "Open" }],
        },
        {
          step: 2,
          title: "Add an item",
          description: "Inside a category, use 'Add item' and capture batch, quantity and expiry. AI Scan can pre-fill from a label or invoice.",
          screenshotCaption: "Add stock",
          annotations: [{ type: "arrow", top: 18, left: 70, width: 20, rotation: 0, label: "Add" }],
        },
        {
          step: 3,
          title: "Create a new category",
          description: "Use '+ Add Category' to create a new group, set an icon and colour, and choose which fields apply.",
          screenshotCaption: "Add category",
          annotations: [{ type: "circle", top: 8, left: 78, width: 18, height: 12, label: "+ Add" }],
        },
      ],
    },
  },
  calibrating: {
    about:
      "Calibrating Stocks tracks medical instruments that need periodic calibration — sphygs, thermometers, scales, pulse oximeters and similar. Record the last calibration date, who's responsible and when the next one is due, so nothing falls out of compliance.",
    howToUse: [
      "Open a category card to see all instruments of that type.",
      "Add an instrument with serial number, last calibration date and interval.",
      "Use the lead/assignee to make sure someone owns each calibration.",
    ],
    topic: {
      id: "stock-calibrating",
      title: "Calibrating Stocks",
      summary: "Keep medical instruments in calibration with clear ownership and due dates.",
      videoDuration: "2:30",
      screenshotUrl: calibratingShot,
      steps: [
        {
          step: 1,
          title: "Pick an instrument category",
          description: "Open the right category (e.g. Sphygmomanometers) to see all instruments of that type.",
          screenshotCaption: "Instrument categories",
          annotations: [{ type: "circle", top: 30, left: 8, width: 22, height: 24, label: "Open" }],
        },
        {
          step: 2,
          title: "Add or update an instrument",
          description: "Record serial number, last calibration date and the calibration interval. The next-due date is calculated for you.",
          screenshotCaption: "Instrument details",
          annotations: [{ type: "arrow", top: 50, left: 30, width: 22, rotation: 0, label: "Calibration" }],
        },
        {
          step: 3,
          title: "Assign a lead",
          description: "Assign a responsible team member so calibration tasks have a clear owner and appear in their queue.",
          screenshotCaption: "Assign lead",
          annotations: [{ type: "circle", top: 65, left: 60, width: 22, height: 14, label: "Lead" }],
        },
      ],
    },
  },
  electrical: {
    about:
      "Test & Tagging tracks safety testing for all powered equipment in the practice — appliances, autoclaves, lights, computers. Record the test date, tag number and tester, and the system tells you what's compliant and what's overdue.",
    howToUse: [
      "Use the filters to find equipment by status (compliant, due, overdue).",
      "Open an item to update its last test date, tag number and tester.",
      "Items overdue for testing are highlighted so they can be actioned first.",
    ],
    topic: {
      id: "stock-electrical",
      title: "Test & Tagging",
      summary: "Maintain electrical safety compliance with test dates and tag numbers.",
      videoDuration: "2:20",
      screenshotUrl: electricalShot,
      steps: [
        {
          step: 1,
          title: "Filter the list",
          description: "Use the search and status filters to focus on what's due or overdue.",
          screenshotCaption: "Filters",
          annotations: [{ type: "arrow", top: 28, left: 16, width: 22, rotation: 0, label: "Filter" }],
        },
        {
          step: 2,
          title: "Update a test record",
          description: "Open an item and record the last test date, tag number and tester's name.",
          screenshotCaption: "Test record",
          annotations: [{ type: "circle", top: 55, left: 40, width: 30, height: 14, label: "Edit" }],
        },
        {
          step: 3,
          title: "Action overdue items",
          description: "Overdue items are flagged in red — schedule a re-test or take the item out of service.",
          screenshotCaption: "Overdue status",
          annotations: [{ type: "circle", top: 60, left: 82, width: 14, height: 12, label: "Status" }],
        },
      ],
    },
  },
};
