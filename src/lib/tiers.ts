export type AccountTier = "free" | "premium";

export const TIER_LIMITS = {
  free: {
    maxImportMessages: 12_000,
    maxPersistMessages: 8_000,
    maxAiQuestionsPerDay: 12,
    maxContextMessages: 400,
    maxUploadBytes: 80 * 1024 * 1024,
  },
  premium: {
    maxImportMessages: Number.POSITIVE_INFINITY,
    maxPersistMessages: 80_000,
    maxAiQuestionsPerDay: Number.POSITIVE_INFINITY,
    maxContextMessages: 2_000,
    maxUploadBytes: 200 * 1024 * 1024,
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
