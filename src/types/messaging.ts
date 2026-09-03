export interface MessageAttachment {
  id: string;
  name: string;
  /** MIME type */
  type: string;
  /** Size in bytes */
  size: number;
  /** Data URL of the file contents */
  dataUrl: string;
  kind: "image" | "file";
}

export interface ChatMessage {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  content: string;
  attachments: MessageAttachment[];
  createdAt: string;
  /** Set when the message has been edited */
  editedAt?: string;
}

export type ConversationKind = "group" | "direct";

export interface MessageGroup {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdAt: string;
  createdBy: string;
  /** Defaults to "group" when absent */
  kind?: ConversationKind;
}

