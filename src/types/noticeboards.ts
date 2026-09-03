export type NoticeboardLocation = "reception" | "waiting_room" | "staff_room" | "other";

export const NOTICEBOARD_LOCATION_LABELS: Record<NoticeboardLocation, string> = {
  reception: "Reception",
  waiting_room: "Waiting Room",
  staff_room: "Staff Room",
  other: "Other",
};

export interface Notice {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  durationSeconds: number;
  createdAt: Date;
}

// ---- Containers ---------------------------------------------------------
export type ContainerType =
  | "checklist_completion"
  | "task_completion"
  | "expiry_centre"
  | "picture_text"
  | "text_box"
  | "statistics";

export const CONTAINER_TYPE_LABELS: Record<ContainerType, string> = {
  checklist_completion: "Checklist Completion",
  task_completion: "Task Completion",
  expiry_centre: "Expiry Centre",
  picture_text: "Picture & Text",
  text_box: "Text Box",
  statistics: "Statistics",
};

interface BaseContainer {
  id: string;
  type: ContainerType;
  durationSeconds: number;
}

export interface ChecklistCompletionContainer extends BaseContainer {
  type: "checklist_completion";
}
export interface TaskCompletionContainer extends BaseContainer {
  type: "task_completion";
}
export interface ExpiryCentreContainer extends BaseContainer {
  type: "expiry_centre";
}
export interface PictureTextContainer extends BaseContainer {
  type: "picture_text";
  imageUrl?: string;
  headline: string;
  paragraph: string; // max 50 chars
}
export interface TextBoxContainer extends BaseContainer {
  type: "text_box";
  header: string;
  paragraph: string; // max 50 chars
}
export interface StatisticsContainer extends BaseContainer {
  type: "statistics";
  header: string;
  items: { label: string; value: string }[]; // 3 items
}

export type NoticeboardContainer =
  | ChecklistCompletionContainer
  | TaskCompletionContainer
  | ExpiryCentreContainer
  | PictureTextContainer
  | TextBoxContainer
  | StatisticsContainer;

export interface Noticeboard {
  id: string;
  name: string;
  location: NoticeboardLocation;
  departmentId?: string;
  pairingCode: string;
  paired: boolean;
  published?: boolean;
  publishedAt?: Date;
  notices: Notice[];
  linkedMemoIds: string[]; // not used for waiting_room
  containers?: NoticeboardContainer[];
  createdAt: Date;
}
