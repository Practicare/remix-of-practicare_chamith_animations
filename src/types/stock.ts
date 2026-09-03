import { differenceInDays } from "date-fns";

export type StockStatus = 'valid' | 'expiring' | 'expired';
export type VaccineFundingType = 'government' | 'private';

export interface StockCategory {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isDefault: boolean;
}

// Field configuration per category
export interface CategoryFieldConfig {
  showExpiry: boolean;
  showBatchNumber: boolean;
  showCalibration: boolean;
  showVaccineFunding: boolean;
  expiryRequired: boolean;
}

export const CATEGORY_FIELD_CONFIG: Record<string, CategoryFieldConfig> = {
  'doctors-bag': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: true,
    showVaccineFunding: false,
    expiryRequired: true,
  },
  'drug-cupboard': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: false,
    showVaccineFunding: false,
    expiryRequired: true,
  },
  'instruments': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: true,
    showVaccineFunding: false,
    expiryRequired: true,
  },
  'medication-samples': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: false,
    showVaccineFunding: false,
    expiryRequired: true,
  },
  'consumables': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: false,
    showVaccineFunding: false,
    expiryRequired: true,
  },
  'vaccines': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: false,
    showVaccineFunding: true,
    expiryRequired: true,
  },
  'patient-owned': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: false,
    showVaccineFunding: false,
    expiryRequired: false,
  },
  'emergency-trolley': {
    showExpiry: true,
    showBatchNumber: true,
    showCalibration: true,
    showVaccineFunding: false,
    expiryRequired: true,
  },
};

// Default config for custom categories
export const DEFAULT_FIELD_CONFIG: CategoryFieldConfig = {
  showExpiry: true,
  showBatchNumber: true,
  showCalibration: false,
  showVaccineFunding: false,
  expiryRequired: true,
};

export interface StockBatch {
  id: string;
  batchNumber: string;
  expiryDate?: Date;
  quantity: number;
  unitPrice?: number;
  status?: StockStatus;
}

export function computeBatchStatus(expiryDate?: Date): StockStatus {
  if (!expiryDate) return 'valid';
  const days = differenceInDays(expiryDate, new Date());
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring';
  return 'valid';
}

export function deriveBatchMeta(batches: StockBatch[]) {
  const totalQty = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const dated = batches
    .filter((b) => b.expiryDate)
    .sort((a, b) => a.expiryDate!.getTime() - b.expiryDate!.getTime());
  const earliest = dated[0]?.expiryDate;
  return {
    quantity: totalQty,
    expiryDate: earliest,
    batchNumber: batches[0]?.batchNumber,
    status: computeBatchStatus(earliest),
  };
}

export interface StockItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  quantity: number;
  buyingPrice?: number;
  batches?: StockBatch[];
  expiryDate?: Date;
  status: StockStatus;
  location?: string;
  /** Additional rooms this item is allocated to (multi-allocation). */
  allocatedRooms?: string[];
  /** Quantity allocated to each additional room (room name -> quantity). */
  allocatedRoomQuantities?: Record<string, number>;
  /** Additional stock categories this item is allocated to (multi-allocation). */
  allocatedCategoryIds?: string[];
  batchNumber?: string;
  // Calibration fields (for instruments & doctor's bag)
  calibrationDate?: Date;
  nextCalibrationDate?: Date;
  // Inspection & review fields
  inspectionDate?: Date;
  reviewDate?: Date;
  // Annual & 6-month review dates
  annualReviewDate?: Date;
  sixMonthReviewDate?: Date;
  // Electrical testing & tagging
  electricalTestDate?: Date;
  nextElectricalTestDate?: Date;
  electricalTagNumber?: string;
  // Lead / supervising team member
  leadId?: string;
  leadName?: string;
  // Image
  imageUrl?: string;
  // Vaccine fields
  vaccineFundingType?: VaccineFundingType;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_STOCK_CATEGORIES: StockCategory[] = [
  { id: 'doctors-bag', name: "Doctor's Bag", displayName: "Dr's Bag", description: 'Medical equipment for home visits', icon: 'Briefcase', isDefault: true },
  { id: 'drug-cupboard', name: 'Drug Cupboard', displayName: 'Drugs', description: 'Controlled and general medications', icon: 'Pill', isDefault: true },
  { id: 'instruments', name: 'Reusable Instruments', displayName: 'Reusable', description: 'Reusable medical instruments and tools', icon: 'Stethoscope', isDefault: true },
  { id: 'medication-samples', name: 'Medication Samples', displayName: 'Samples', description: 'Sample medications from suppliers', icon: 'TestTube', isDefault: true },
  { id: 'consumables', name: 'Consumables', displayName: 'Consumables', description: 'Disposable medical supplies', icon: 'Package', isDefault: true },
  { id: 'vaccines', name: 'Vaccines', displayName: 'Vaccines', description: 'Vaccine stock and cold chain items', icon: 'Syringe', isDefault: true },
  { id: 'patient-owned', name: 'Patient-Owned Items', displayName: 'Patient', description: 'Medications and items owned by patients', icon: 'Users', isDefault: true },
  { id: 'emergency-trolley', name: 'Emergency Trolley', displayName: 'Emergency', description: 'Emergency response equipment and medications', icon: 'Ambulance', isDefault: true },
];

export const DEFAULT_CALIBRATION_CATEGORIES: StockCategory[] = [
  { id: 'vital-signs', name: 'Vital Signs & Physiological Monitoring Devices', displayName: 'Vital Signs', description: 'Blood pressure monitors, pulse oximeters, thermometers and ECG devices', icon: 'HeartPulse', isDefault: true },
  { id: 'diagnostic-measurement', name: 'Diagnostic Measurement Equipment', displayName: 'Diagnostics', description: 'Scales, audiometers, spirometers and ophthalmoscopes', icon: 'Ruler', isDefault: true },
  { id: 'sterilization-infection', name: 'Sterilization & Infection Control Equipment', displayName: 'Sterilization', description: 'Autoclaves, sterilizers and disinfection equipment', icon: 'ShieldCheck', isDefault: true },
  { id: 'therapeutic-treatment', name: 'Therapeutic & Treatment Devices', displayName: 'Therapeutic', description: 'Nebulizers, defibrillators and infusion devices', icon: 'Activity', isDefault: true },
];

export const STATUS_COLORS: Record<StockStatus, string> = {
  valid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  expiring: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const VACCINE_FUNDING_LABELS: Record<VaccineFundingType, string> = {
  government: 'Government Funded',
  private: 'Private',
};
