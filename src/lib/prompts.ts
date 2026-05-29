import type { UseCaseId } from "./use-cases";

export interface GuidedPrompt {
  id: string;
  label: string;
  question: string;
}

const COUPLES: GuidedPrompt[] = [
  { id: "trigger", label: "What escalated?", question: "Based on this transcript, what moments likely escalated tension? List 2–3 with quotes if possible." },
  { id: "repair", label: "Who repairs?", question: "Who tends to apologize or reach out first after conflict? Use message evidence." },
  { id: "past", label: "Talking past each other?", question: "Are we answering each other's actual concerns, or talking past each other? Give examples." },
  { id: "needs", label: "Unmet needs", question: "What emotional needs might each person be signaling (reassurance, space, respect)? Stay neutral." },
  { id: "next", label: "What to say next", question: "Suggest one calm message I could send to move toward resolution — not manipulative, under 3 sentences." },
  { id: "balance", label: "Who texts more?", question: "Who initiates more and who carries the conversation? Is the balance healthy or one-sided?" },
];

const FRIENDS: GuidedPrompt[] = [
  { id: "dominant", label: "Who dominates?", question: "Who sends the most messages and drives topics in this group?" },
  { id: "ghost", label: "Who goes quiet?", question: "Who participates least and when do they drop off?" },
  { id: "plans", label: "Do plans happen?", question: "Do concrete plans get made or does chat stay vague? Summarize with examples." },
];

const FAMILY: GuidedPrompt[] = [
  { id: "checkin", label: "Who checks in?", question: "Who initiates caring check-ins vs logistical messages?" },
  { id: "tension", label: "Recurring tension", question: "What topics or phrases repeat before tension? List patterns neutrally." },
];

const WORK: GuidedPrompt[] = [
  { id: "hours", label: "After-hours?", question: "How much of this thread happens outside 9am–6pm on weekdays? Estimate from timestamps if visible." },
  { id: "tone", label: "Tone check", question: "Is the tone mostly professional, urgent, or passive-aggressive? Give brief examples." },
];

const REFLECTION: GuidedPrompt[] = [
  { id: "interest", label: "Mutual interest?", question: "From message balance and tone, does interest seem mutual or one-sided? Be direct but kind." },
  { id: "initiation", label: "Who initiates?", question: "Who starts conversations more often? Cite approximate pattern." },
];

const GENERAL: GuidedPrompt[] = [
  { id: "summary", label: "Summarize vibe", question: "Summarize the overall vibe and communication style of this thread in 5 bullets." },
  { id: "flags", label: "Any red flags?", question: "Any concerning patterns (dismissiveness, guilt-tripping, stonewalling)? Stay factual." },
];

const BY_CASE: Record<UseCaseId, GuidedPrompt[]> = {
  couples: COUPLES,
  friends: FRIENDS,
  family: FAMILY,
  work: WORK,
  reflection: REFLECTION,
  general: GENERAL,
};

export function getPromptsForUseCase(useCase: UseCaseId | undefined): GuidedPrompt[] {
  return BY_CASE[useCase ?? "general"] ?? GENERAL;
}
