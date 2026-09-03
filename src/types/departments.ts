// Centralized Department definitions shared across Staff, Tasks, Checklists, and other modules

export type DepartmentType = "internal" | "external";

export interface Department {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: DepartmentType;
  isDefault?: boolean;
}

export const DEFAULT_DEPARTMENTS: Department[] = [
  { id: "reception", name: "Reception", description: "Front desk and patient services", icon: "Phone", color: "bg-blue-500", type: "internal", isDefault: true },
  { id: "nursing", name: "Nursing", description: "Registered nurses and assistants", icon: "Heart", color: "bg-pink-500", type: "internal", isDefault: true },
  { id: "doctors", name: "Doctors", description: "Medical practitioners", icon: "Stethoscope", color: "bg-green-500", type: "internal", isDefault: true },
  { id: "admin", name: "Administration", description: "Office and administrative staff", icon: "FileText", color: "bg-purple-500", type: "internal", isDefault: true },
  { id: "management", name: "Management", description: "Practice managers and supervisors", icon: "Briefcase", color: "bg-orange-500", type: "internal", isDefault: true },
  { id: "owners", name: "Owners", description: "Practice owners", icon: "Crown", color: "bg-amber-500", type: "internal", isDefault: true },
  { id: "it", name: "IT Support", description: "Technical and IT support", icon: "Monitor", color: "bg-cyan-500", type: "internal", isDefault: true },
  { id: "cleaners", name: "Cleaners", description: "Cleaning contractors", icon: "SprayCan", color: "bg-emerald-500", type: "external", isDefault: true },
  { id: "accountant", name: "Accountant", description: "External accounting services", icon: "Calculator", color: "bg-slate-500", type: "external", isDefault: true },
  { id: "external", name: "External", description: "Other contractors and external staff", icon: "Building2", color: "bg-gray-500", type: "external", isDefault: true },
];

export const DEPARTMENT_COLORS: Record<string, string> = DEFAULT_DEPARTMENTS.reduce((acc, dept) => {
  acc[dept.id] = dept.color;
  return acc;
}, {} as Record<string, string>);

// Helper to get department by ID
export const getDepartmentById = (departments: Department[], id: string): Department | undefined => {
  return departments.find(d => d.id === id);
};

// Helper to get departments by type
export const getDepartmentsByType = (departments: Department[], type: DepartmentType): Department[] => {
  return departments.filter(d => d.type === type);
};
