import { TrainingTopic } from "@/components/staffResourceCentre/TrainingTopicDialog";
import roomsShot from "@/assets/training-screenshots/rooms.png";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const ROOMS_PRACTICE_TIP: TipConfig = {
  about:
    "Rooms lets you organise your practice into physical spaces — consulting rooms, treatment rooms, storage areas and more. Each room tracks its own equipment inventory, so you always know what lives where and can run room-specific stocktakes.",
  howToUse: [
    "Click any room card to open its detail page and see all equipment inside.",
    "Use '+ Add Room' to create a new room, then fill it with items by category.",
    "Search by room number or name to quickly find the right space.",
  ],
  topic: {
    id: "rooms-overview",
    title: "Room Setup",
    summary: "Organise your practice into rooms and track equipment per space.",
    videoDuration: "2:20",
    screenshotUrl: roomsShot,
    steps: [
      {
        step: 1,
        title: "Open a room",
        description: "Click any room card to see every item assigned to that space. You can add, edit or remove equipment from here.",
        screenshotCaption: "Room grid",
        annotations: [{ type: "circle", top: 35, left: 12, width: 24, height: 24, label: "Open" }],
      },
      {
        step: 2,
        title: "Add a room",
        description: "Use the '+ Add Room' button to create a new space. Give it a number, name and description, then start adding equipment.",
        screenshotCaption: "Add room",
        annotations: [{ type: "arrow", top: 18, left: 70, width: 20, rotation: 0, label: "Add" }],
      },
      {
        step: 3,
        title: "Search rooms",
        description: "Search by room number, name or description to quickly locate the right space without scrolling.",
        screenshotCaption: "Search bar",
        annotations: [{ type: "arrow", top: 22, left: 8, width: 22, rotation: 0, label: "Search" }],
      },
    ],
  },
};
