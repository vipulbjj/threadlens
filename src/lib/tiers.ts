export type AccountTier = "free" | "premium";

/** Browser parsing + localStorage are the real caps; tier limits are guardrails, not paywalls. */
export const TIER_LIMITS = {
  free: {
    /** On-device stats only — does not increase AI context (see maxContextMessages). */
    maxImportMessages: 35_000,
    maxPersistMessages: 15_000,
    maxAiQuestionsPerDay: 30,
    maxContextMessages: 500,
    maxUploadBytes: 100 * 1024 * 1024,
  },
  premium: {
    maxImportMessages: Number.POSITIVE_INFINITY,
    maxPersistMessages: 80_000,
    /** Overridden at runtime by PREMIUM_AI_DAILY_CAP — not unlimited on public deploys. */
    maxAiQuestionsPerDay: 150,
    maxContextMessages: 1_000,
    /** No artificial cap — large exports are limited by device RAM, not billing. */
    maxUploadBytes: 512 * 1024 * 1024,
  },
} as const;

export function tierFromPremium(isPremium: boolean): AccountTier {
  return isPremium ? "premium" : "free";
}

export function getLimits(tier: AccountTier) {
  return TIER_LIMITS[tier];
}

export interface CapResult {
  messages: import("./parser").ParsedMessage[];
  truncated: boolean;
  originalCount: number;
  tier: AccountTier;
}

export function capMessagesForTier<T>(
  messages: T[],
  tier: AccountTier
): { messages: T[]; truncated: boolean; originalCount: number } {
  const max = getLimits(tier).maxImportMessages;
  if (messages.length <= max) {
    return { messages, truncated: false, originalCount: messages.length };
  }
  return {
    messages: messages.slice(-max),
    truncated: true,
    originalCount: messages.length,
  };
}

export function persistMessageLimit(tier: AccountTier) {
  return getLimits(tier).maxPersistMessages;
}

export const TIER_STORAGE_KEY = "threadlens-tier";

export function readCachedTier(): AccountTier {
  if (typeof window === "undefined") return "free";
  return window.localStorage.getItem(TIER_STORAGE_KEY) === "premium" ? "premium" : "free";
}

export function writeCachedTier(tier: AccountTier) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIER_STORAGE_KEY, tier);
}
