export interface SeenBy {
  userId: string;
  userName: string;
  seenAt: Date;
  avatarInitials: string;
}

export interface CommunicationNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorDepartment: string;
  authorInitials: string;
  createdAt: Date;
  seenBy: SeenBy[];
  /** Communication book this note belongs to. "general" for the shared book, or a department id. */
  bookId?: string;
}
