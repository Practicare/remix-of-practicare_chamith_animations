export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color?: string;
  createdAt: string;
}

export interface DocumentFile {
  id: string;
  folderId: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  tags: string[];
  description?: string;
  taskId?: string;
  taskTitle?: string;
  shareToKnowledge: boolean;
  knowledgeDocId?: string;
  uploadedAt: string;
  uploadedBy: string;
}
