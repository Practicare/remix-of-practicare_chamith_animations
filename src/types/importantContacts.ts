export interface ImportantContact {
  id: string;
  name: string;
  category?: string;
  /** Phone number(s) */
  phone?: string;
  email?: string;
  fax?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
