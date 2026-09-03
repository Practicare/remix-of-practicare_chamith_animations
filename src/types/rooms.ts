export type InstrumentCategory = 
  | "Computer"
  | "Printer"
  | "Trolley"
  | "Sharps Bin"
  | "Clinical Waste"
  | "Scale"
  | "BP Machine"
  | "ECG Machine"
  | "Examination Couch"
  | "Defibrillator"
  | "Oxygen Equipment"
  | "Sterilizer"
  | "Refrigerator"
  | "Other";

export const INSTRUMENT_CATEGORIES: InstrumentCategory[] = [
  "Computer",
  "Printer",
  "Trolley",
  "Sharps Bin",
  "Clinical Waste",
  "Scale",
  "BP Machine",
  "ECG Machine",
  "Examination Couch",
  "Defibrillator",
  "Oxygen Equipment",
  "Sterilizer",
  "Refrigerator",
  "Other",
];

export const CATEGORY_ICONS: Record<InstrumentCategory, string> = {
  "Computer": "Monitor",
  "Printer": "Printer",
  "Trolley": "ShoppingCart",
  "Sharps Bin": "Trash2",
  "Clinical Waste": "Package",
  "Scale": "Scale",
  "BP Machine": "Activity",
  "ECG Machine": "HeartPulse",
  "Examination Couch": "BedDouble",
  "Defibrillator": "Zap",
  "Oxygen Equipment": "Wind",
  "Sterilizer": "Sparkles",
  "Refrigerator": "Thermometer",
  "Other": "Box",
};

export interface Instrument {
  id: string;
  category: InstrumentCategory;
  name: string;
  instrumentNumber: string;
  notes?: string;
  status: "active" | "maintenance" | "inactive";
  addedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  description?: string;
  instruments: Instrument[];
  createdAt: string;
  updatedAt: string;
}
