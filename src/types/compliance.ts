export type ComplianceLevel = 'user' | 'practice';

export type ReminderType = 'email' | 'sms';

export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface ComplianceItem {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  details: string;
  level: ComplianceLevel;
  assignee?: string; // Only for user-level
  expiryDate: Date;
  reminder: {
    enabled: boolean;
    type: ReminderType;
    daysBefore: number;
  };
  status: 'valid' | 'expiring' | 'expired';
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ComplianceCategoryType = 'user' | 'practice';

export interface ComplianceCategoryExtended {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isDefault: boolean;
  type: ComplianceCategoryType;
}

export const DEFAULT_COMPLIANCE_CATEGORIES: ComplianceCategoryExtended[] = [
  { id: 'cpr', name: 'CPR Certification', displayName: 'CPR', description: 'Cardiopulmonary resuscitation certification', icon: 'HeartPulse', isDefault: true, type: 'user' },
  { id: 'ahpra', name: 'Medical Registration', displayName: 'Medical Registration', description: 'Medical practitioner registration', icon: 'Stethoscope', isDefault: true, type: 'user' },
  { id: 'safety', name: 'Safety Inspections', displayName: 'Safety', description: 'Workplace safety compliance checks', icon: 'HardHat', isDefault: true, type: 'practice' },
  { id: 'indemnity', name: 'Indemnity Insurance', displayName: 'Indemnity', description: 'Professional indemnity insurance', icon: 'Umbrella', isDefault: true, type: 'user' },
  { id: 'wwcc', name: 'Working with Children Check', displayName: 'WWCC', description: 'Working with Children Check clearance', icon: 'Users', isDefault: true, type: 'user' },
  { id: 'council', name: 'Council Registration', displayName: 'Council', description: 'Council registrations and permits', icon: 'Landmark', isDefault: true, type: 'practice' },
  { id: 'business', name: 'Business Registration', displayName: 'Business', description: 'Business name and registration compliance', icon: 'Building2', isDefault: true, type: 'practice' },
  { id: 'website', name: 'Website & Domain', displayName: 'Website', description: 'Website domain and hosting compliance', icon: 'Globe', isDefault: true, type: 'practice' },
  { id: 'training', name: 'Training Requirements', displayName: 'Training', description: 'Mandatory training and professional development requirements', icon: 'GraduationCap', isDefault: true, type: 'user' },
  { id: 'exit-lights', name: 'Exit Lights', displayName: 'Exit Lights', description: 'Emergency exit lighting inspection and compliance', icon: 'DoorOpen', isDefault: true, type: 'practice' },
  { id: 'fire-extinguisher', name: 'Fire Extinguisher', displayName: 'Fire Ext.', description: 'Fire extinguisher servicing and certification', icon: 'FlameKindling', isDefault: true, type: 'practice' },
  { id: 'smoke-alarms', name: 'Smoke Alarms', displayName: 'Smoke Alarms', description: 'Smoke alarm testing and maintenance compliance', icon: 'Siren', isDefault: true, type: 'practice' },
];
