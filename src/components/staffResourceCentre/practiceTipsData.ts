import { TrainingTopic } from "./TrainingTopicDialog";
import aboutShot from "@/assets/training-screenshots/about.png";
import providersShot from "@/assets/training-screenshots/providers.png";
import guidesShot from "@/assets/training-screenshots/guides.png";
import knowledgeShot from "@/assets/training-screenshots/knowledge.png";
import contactsShot from "@/assets/training-screenshots/contacts.png";

export type ResourceTabKey = "about" | "providers" | "guides" | "knowledge" | "contacts";

interface TipConfig {
  topic: TrainingTopic;
  about: string;
  howToUse: string[];
}

export const PRACTICE_TIPS: Record<ResourceTabKey, TipConfig> = {
  about: {
    about:
      "This page is the single source of truth for your practice's identity — contact details, opening hours, services and closed dates. Keep it accurate so the team and your tools (rosters, AI assistant, exports) always have the right information.",
    howToUse: [
      "Open the section you want to update (Contact, Hours, Services, Closed dates).",
      "Click the pencil to edit, or use AI Scan to extract details from an existing document.",
      "Save your changes — they apply across the whole practice immediately.",
    ],
    topic: {
      id: "about-practice",
      title: "About the Practice",
      summary: "Keep your contact details, hours, services and closure calendar current.",
      videoDuration: "2:45",
      screenshotUrl: aboutShot,
      steps: [
        {
          step: 1,
          title: "Open the section to edit",
          description: "Pick Contact, Opening hours, Services or Closed dates from the cards on the page.",
          screenshotCaption: "About the Practice \u00b7 Sections",
          annotations: [
            { type: "circle", top: 30, left: 8, width: 28, height: 18, label: "Tap a card" },
          ],
        },
        {
          step: 2,
          title: "Edit inline or use AI Scan",
          description: "Use the pencil icon for manual edits, or AI Scan to extract data from a PDF/letterhead.",
          screenshotCaption: "Edit toolbar",
          annotations: [
            { type: "arrow", top: 18, left: 50, width: 18, rotation: 20, label: "AI Scan" },
          ],
        },
        {
          step: 3,
          title: "Save and verify",
          description: "Changes propagate across rosters, exports and the AI assistant immediately.",
          screenshotCaption: "Save changes",
          annotations: [
            { type: "circle", top: 70, left: 75, width: 14, height: 18, label: "Save" },
          ],
        },
      ],
    },
  },
  providers: {
    about:
      "Manage the practitioners and the services they offer. Linking providers to services powers per-practitioner pricing, roster scheduling and AI booking assistance.",
    howToUse: [
      "Add a provider with their role and credentials.",
      "Attach the services they perform — flat fee or per-practitioner pricing.",
      "Reorder providers to control how they appear in dropdowns and exports.",
    ],
    topic: {
      id: "providers-services",
      title: "Providers & Services",
      summary: "Maintain practitioners, services and pricing in one place.",
      videoDuration: "3:10",
      screenshotUrl: providersShot,
      steps: [
        {
          step: 1,
          title: "Add a provider",
          description: "Use \u2018New provider\u2019 to create a record with name, role and AHPRA / registration details.",
          screenshotCaption: "Providers list",
          annotations: [{ type: "circle", top: 14, left: 78, width: 14, height: 22, label: "New" }],
        },
        {
          step: 2,
          title: "Attach services",
          description: "Open the provider and add the services they perform. Set a flat price or per-practitioner pricing.",
          screenshotCaption: "Provider detail",
          annotations: [{ type: "arrow", top: 50, left: 30, width: 22, rotation: 0, label: "Attach service" }],
        },
        {
          step: 3,
          title: "Reorder and publish",
          description: "Drag to set the order shown in dropdowns and the public booking flow.",
          screenshotCaption: "Reorder",
          annotations: [{ type: "circle", top: 55, left: 8, width: 8, height: 12, label: "Drag" }],
        },
      ],
    },
  },
  guides: {
    about:
      "This section guides your practice team on what to do in specific circumstances. You can create new action guides and add pictures to help your team follow along. Use the FAQ menu page on the left column for commonly asked questions, and keep this space for specific actions. Your team can also use the AI chat assistant to get quick answers to their questions.",
    howToUse: [
      "Search for a guide by title, step or tag.",
      "Open a guide to see the numbered steps and reference pictures.",
      "Tap a picture to enlarge it for easier reading.",
    ],
    topic: {
      id: "action-guides",
      title: "Action Guides",
      summary: "Guide your practice team on what to do in specific circumstances with step-by-step instructions and pictures.",
      videoDuration: "2:30",
      screenshotUrl: guidesShot,
      steps: [
        {
          step: 1,
          title: "Search or browse",
          description: "Use the search bar with the issue name or a tag like \u2018printer\u2019 or \u2018eftpos\u2019.",
          screenshotCaption: "Search guides",
          annotations: [{ type: "arrow", top: 14, left: 18, width: 22, rotation: 0, label: "Search" }],
        },
        {
          step: 2,
          title: "Open the guide",
          description: "Click a card to see numbered steps and reference pictures. Tap a picture to enlarge.",
          screenshotCaption: "Guide detail",
          annotations: [{ type: "circle", top: 35, left: 30, width: 30, height: 30, label: "Open" }],
        },
        {
          step: 3,
          title: "Add a new guide",
          description: "Admins can click \u2018New issue\u2019 to create a guide, paste in the steps, attach pictures and tag it for fast retrieval. You can also use AI Scan to import steps from an existing document.",
          screenshotCaption: "Create issue",
          annotations: [{ type: "circle", top: 14, left: 84, width: 12, height: 22, label: "New" }],
        },
      ],
    },
  },
  knowledge: {
    about:
      "The Knowledge Base stores reference documents — policies, procedures, supplier info. It's where team members go when they need to know something, not when they need to do something.",
    howToUse: [
      "Browse by category or search to find an article.",
      "Open an article to read it or download attached files.",
      "Admins can add articles manually or with AI Scan from existing PDFs.",
    ],
    topic: {
      id: "knowledge-base",
      title: "Knowledge Base",
      summary: "A central library of articles, policies and reference material.",
      videoDuration: "2:50",
      screenshotUrl: knowledgeShot,
      steps: [
        {
          step: 1,
          title: "Find an article",
          description: "Filter by category or use search. Articles are tagged for quick retrieval.",
          screenshotCaption: "Knowledge Base index",
          annotations: [{ type: "arrow", top: 18, left: 16, width: 22, rotation: 0, label: "Filter" }],
        },
        {
          step: 2,
          title: "Read or download",
          description: "Open the article to read in-app. Attachments can be downloaded for offline use.",
          screenshotCaption: "Article view",
          annotations: [{ type: "circle", top: 60, left: 70, width: 14, height: 16, label: "Download" }],
        },
        {
          step: 3,
          title: "Add knowledge",
          description: "Admins can paste content directly or use AI Scan to import an existing document.",
          screenshotCaption: "New article",
          annotations: [{ type: "circle", top: 14, left: 84, width: 12, height: 22, label: "New" }],
        },
      ],
    },
  },
  contacts: {
    about:
      "Important Contacts is your fast-dial directory — IT support, building manager, equipment suppliers, after-hours doctors. One tap to call, email or copy the number.",
    howToUse: [
      "Use search or category filters to find a contact.",
      "Tap the phone, email or copy icon to action it instantly.",
      "Admins can add contacts manually or use AI Scan to import from a document.",
    ],
    topic: {
      id: "important-contacts",
      title: "Important Contacts",
      summary: "Keep critical contacts one tap away for the whole team.",
      videoDuration: "1:50",
      screenshotUrl: contactsShot,
      steps: [
        {
          step: 1,
          title: "Find a contact",
          description: "Filter by category (IT, Suppliers, Emergency) or search by name.",
          screenshotCaption: "Contacts list",
          annotations: [{ type: "arrow", top: 18, left: 16, width: 22, rotation: 0, label: "Filter" }],
        },
        {
          step: 2,
          title: "Tap to call or copy",
          description: "Action icons let you call, email, or copy the number to clipboard.",
          screenshotCaption: "Contact actions",
          annotations: [{ type: "circle", top: 45, left: 78, width: 14, height: 18, label: "Call" }],
        },
        {
          step: 3,
          title: "Add a contact",
          description: "Admins can add new contacts and assign them to the correct category.",
          screenshotCaption: "New contact",
          annotations: [{ type: "circle", top: 14, left: 84, width: 12, height: 22, label: "New" }],
        },
      ],
    },
  },
};
