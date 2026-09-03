export interface Provider {
  id: string;
  name: string;
  category?: string;
  servicesProvided: string[];
  servicesNotProvided: string[];
  specialNote?: string;
  createdAt: string;
  updatedAt: string;
}
