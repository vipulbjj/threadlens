import { premiumAiDailyCap } from "./ai-guard";
import type { AccountTier } from "./tiers";
import { getLimits } from "./tiers";

export interface UsageSnapshot {
  tier: AccountTier;
  aiQuestionsToday: number;
  aiLimit: number;
  canAskAi: boolean;
  isPremium: boolean;
}

export function usageFromCounts(isPremium: boolean, aiQuestionsToday: number): UsageSnapshot {
  const tier: AccountTier = isPremium ? "premium" : "free";
  const limit = isPremium ? premiumAiDailyCap() : getLimits("free").maxAiQuestionsPerDay;
  return {
    tier,
    aiQuestionsToday,
    aiLimit: limit,
    canAskAi: aiQuestionsToday < limit,
    isPremium,
  };
}

export function startOfUtcDay() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}
