export type UseCaseId =
  | "couples"
  | "friends"
  | "family"
  | "work"
  | "reflection"
  | "general";

export interface UseCaseMeta {
  id: UseCaseId;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  tips: string[];
}

export const USE_CASES: UseCaseMeta[] = [
  {
    id: "couples",
    label: "Couples & conflict",
    emoji: "💬",
    tagline: "Understand fights before the next one",
    description:
      "See who apologizes more, whether you're talking past each other, and get neutral prompts to de-escalate — without posting your chat publicly.",
    tips: [
      "Export just the thread with your partner (without media).",
      "Use guided prompts like \"What triggered the tension?\" or \"Who reaches out first after silence?\"",
      "This is reflection, not therapy — talk to a professional if you are in crisis.",
    ],
  },
  {
    id: "friends",
    label: "Friend group",
    emoji: "👥",
    tagline: "Who carries the group chat?",
    description:
      "Spot who dominates, who goes quiet, and whether plans actually get made — great for college groups and friend circles.",
    tips: ["Group exports work best when everyone uses consistent names.", "Look at message balance, not just total count."],
  },
  {
    id: "family",
    label: "Family",
    emoji: "🏠",
    tagline: "Patterns across generations",
    description:
      "Understand recurring topics, who checks in, and tone shifts in family WhatsApp groups or 1:1 parent threads.",
    tips: ["Sensitive topics stay on your device until you choose to ask AI.", "Start with stats-only review if you prefer."],
  },
  {
    id: "work",
    label: "Work & boundaries",
    emoji: "💼",
    tagline: "After-hours pings and tone",
    description:
      "See if work chats bleed into nights and weekends. Useful for setting boundaries — not for HR investigations.",
    tips: ["Do not upload confidential employer data you are not allowed to export.", "Use for personal boundary reflection only."],
  },
  {
    id: "reflection",
    label: "Situationship / dating",
    emoji: "✨",
    tagline: "Read the room with data",
    description:
      "Message balance, initiation, and tone cues when you are trying to decide if interest is mutual.",
    tips: ["Recent messages matter most — large exports are auto-trimmed to the latest chunk."],
  },
  {
    id: "general",
    label: "Just exploring",
    emoji: "🔍",
    tagline: "Any text export",
    description: "General patterns, stats, and optional AI Q&A for any chat you export.",
    tips: ["Try the sample chat on upload if you want a quick demo."],
  },
];

export function getUseCase(id: UseCaseId | undefined): UseCaseMeta {
  return USE_CASES.find((u) => u.id === id) ?? USE_CASES.find((u) => u.id === "general")!;
}
