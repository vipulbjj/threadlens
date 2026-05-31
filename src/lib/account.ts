import { createAdminClient } from "./supabase/admin";
import { premiumEmailsFromEnv } from "./supabase/config";
import { startOfUtcDay, usageFromCounts, type UsageSnapshot } from "./usage";

export interface AccountInfo {
  userId: string;
  email: string;
  isPremium: boolean;
  usage: UsageSnapshot;
}

function isPremiumEmail(email: string) {
  return premiumEmailsFromEnv().has(email.trim().toLowerCase());
}

export async function resolveAccount(userId: string, email: string): Promise<AccountInfo> {
  const envPremium = isPremiumEmail(email);
  let isPremium = envPremium;
  let aiQuestionsToday = 0;

  const admin = createAdminClient();
  if (admin) {
    const { data: profile } = await admin.from("profiles").select("is_premium, ai_questions_today, ai_day").eq("id", userId).maybeSingle();

    if (profile) {
      const day = startOfUtcDay();
      if (profile.ai_day === day) {
        aiQuestionsToday = profile.ai_questions_today ?? 0;
      }
      isPremium = Boolean(profile.is_premium) || envPremium;
    } else {
      await admin.from("profiles").upsert({
        id: userId,
        email,
        is_premium: envPremium,
        ai_questions_today: 0,
        ai_day: startOfUtcDay(),
      });
      isPremium = envPremium;
    }

    if (envPremium) {
      await admin.from("profiles").update({ is_premium: true }).eq("id", userId);
    }
  }

  return {
    userId,
    email,
    isPremium,
    usage: usageFromCounts(isPremium, aiQuestionsToday),
  };
}

export async function incrementAiUsage(userId: string, email: string) {
  const admin = createAdminClient();
  if (!admin) return;

  const account = await resolveAccount(userId, email);
  if (!account.usage.canAskAi) return;

  const day = startOfUtcDay();
  const next = account.usage.aiQuestionsToday + 1;
  await admin.from("profiles").upsert({
    id: userId,
    email,
    ai_questions_today: next,
    ai_day: day,
    is_premium: account.isPremium,
  });
}
