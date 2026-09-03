export interface KnowledgeDocument {
  id: string;
  name: string;
  /** MIME type, e.g. application/pdf */
  type: string;
  /** Size in bytes */
  size: number;
  /** Data URL of the file contents */
  dataUrl: string;
  tags?: string[];
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}
