/** Human-readable copy for daily AI question limits (free + capped premium). */

export function aiQuestionsRemaining(used: number, limit: number): number {
  if (limit < 0) return Number.POSITIVE_INFINITY;
  return Math.max(0, limit - used);
}

/** Header / compact surfaces — prefer remaining count. */
export function formatAiQuotaCompact(used: number, limit: number): string {
  if (limit < 0) return "Unlimited AI questions";
  const left = aiQuestionsRemaining(used, limit);
  if (left === 0) return "No AI questions left today";
  if (left === 1) return "1 AI question left today";
  return `${left} of ${limit} AI questions left today`;
}

/** Chat footer / account — full sentence. */
export function formatAiQuotaDetail(used: number, limit: number): string {
  if (limit < 0) return "Premium: unlimited AI questions per day.";
  const left = aiQuestionsRemaining(used, limit);
  return `Free plan: ${used} of ${limit} AI questions used today · ${left} remaining · Resets at midnight UTC`;
}

export function formatAiQuotaTitle(used: number, limit: number): string {
  if (limit < 0) return "Premium — no daily AI cap";
  return `${used} of ${limit} AI questions used today on the free plan. Resets at midnight UTC.`;
}
