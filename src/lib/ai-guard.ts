import type { AccountTier } from "./tiers";
import { getLimits } from "./tiers";

/** Hard caps on what we send to the LLM — main lever for public token spend. */
const MAX_CHARS_PER_MESSAGE = 280;
const MAX_CONTEXT_CHARS: Record<AccountTier, number> = {
  free: 28_000,   // ~7k tokens, last ~200-350 msgs depending on length
  premium: 80_000, // ~20k tokens, last ~400-800 msgs depending on length
};
const MAX_MESSAGES_IN_BODY = 10_000;

export function premiumAiDailyCap(): number {
  const raw = process.env.PREMIUM_AI_DAILY_CAP?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 150;
}

export function maxMessagesInChatBody() {
  return MAX_MESSAGES_IN_BODY;
}

/** Only send recent messages in the API body — full thread stats travel separately. */
export function sliceMessagesForAiPayload(
  messages: { sender: string; message: string }[],
  tier: AccountTier
) {
  const maxMsgs = getLimits(tier).maxContextMessages;
  return messages.slice(-maxMsgs).map((m) => ({
    sender: String(m.sender ?? "Unknown"),
    message: String(m.message ?? ""),
  }));
}

export function buildBoundedContext(
  messages: { sender: string; message: string }[],
  tier: AccountTier
): { context: string; messageCount: number; truncated: boolean } {
  const maxMsgs = getLimits(tier).maxContextMessages;
  const slice = messages.slice(-maxMsgs);
  const maxChars = MAX_CONTEXT_CHARS[tier];
  const lines: string[] = [];
  let used = 0;
  let truncated = slice.length < messages.length;

  for (const m of slice) {
    const sender = String(m.sender ?? "Unknown").slice(0, 80);
    const body = String(m.message ?? "").slice(0, MAX_CHARS_PER_MESSAGE);
    const line = `${sender}: ${body}`;
    if (used + line.length + 1 > maxChars) {
      truncated = true;
      break;
    }
    lines.push(line);
    used += line.length + 1;
  }

  return { context: lines.join("\n"), messageCount: lines.length, truncated };
}

export function maxOutputTokens(tier: AccountTier) {
  return tier === "premium" ? 800 : 500;
}
