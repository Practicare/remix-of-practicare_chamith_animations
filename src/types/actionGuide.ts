export interface ActionGuide {
  id: string;
  title: string;
  /** HTML content for the action steps */
  content: string;
  /** Data URLs for attached images */
  images: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
