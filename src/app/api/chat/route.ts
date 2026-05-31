import { NextResponse } from "next/server";
import { resolveAiProvider, systemPromptForUseCase } from "@/lib/ai-provider";
import {
  buildBoundedContext,
  maxMessagesInChatBody,
  maxOutputTokens,
} from "@/lib/ai-guard";
import { mapChatApiError } from "@/lib/chat-api-errors";
import { resolveAccount, incrementAiUsage } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, premiumContactEmail } from "@/lib/supabase/config";
import { tierFromPremium } from "@/lib/tiers";

/** Vercel defaults to ~10s without this; large premium threads often need 20–45s for xAI. */
export const maxDuration = 60;

const MAX_QUESTION_CHARS = 2000;
const MAX_BODY_BYTES = 2_000_000;
/** Stay under maxDuration so Vercel does not kill the function mid-flight. */
const AI_ABORT_MS = 58_000;

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }

    const provider = resolveAiProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "AI is not configured on the server. Add XAI_API_KEY in Vercel env." },
        { status: 503 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Sign-in is required before AI can be enabled on this deployment." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Auth service unavailable." }, { status: 503 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json(
        { error: "Sign in to use AI questions (free tier includes 30 per day)." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const messages = body.messages;
    const totalMessageCount =
      typeof body.totalMessageCount === "number" && body.totalMessageCount > 0
        ? Math.floor(body.totalMessageCount)
        : Array.isArray(messages)
          ? messages.length
          : 0;
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const useCase = typeof body.useCase === "string" ? body.useCase : undefined;
    const threadStats =
      typeof body.threadStats === "string" && body.threadStats.trim()
        ? body.threadStats.slice(0, 8_000)
        : null;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No chat messages provided." }, { status: 400 });
    }
    if (messages.length > maxMessagesInChatBody()) {
      return NextResponse.json({ error: "Too many messages in one request." }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: "Ask a question about this thread." }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_CHARS) {
      return NextResponse.json({ error: "Question is too long." }, { status: 400 });
    }

    const account = await resolveAccount(user.id, user.email);
    if (!account.usage.canAskAi) {
      const capLabel = account.isPremium ? "Premium" : "Free";
      return NextResponse.json(
        {
          error: `${capLabel} daily AI limit reached (${account.usage.aiLimit} questions per UTC day). Try again tomorrow or contact support.`,
          code: "quota_exceeded",
          premiumContact: premiumContactEmail(),
        },
        { status: 429 }
      );
    }

    const tier = tierFromPremium(account.isPremium);
    const bounded = buildBoundedContext(messages, tier);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_ABORT_MS);

    try {
      const completion = await provider.client.chat.completions.create(
        {
          model: provider.model,
          messages: [
            { role: "system", content: systemPromptForUseCase(useCase) },
            {
              role: "user",
              content: [
                threadStats
                  ? `Thread-wide statistics (computed over all ${totalMessageCount.toLocaleString()} messages — not just the excerpt below):\n${threadStats}`
                  : null,
                `Recent messages (last ~${bounded.messageCount} for conversational context):\n${bounded.context}`,
                `Question: ${question}`,
              ]
                .filter(Boolean)
                .join("\n\n"),
            },
          ],
          max_tokens: maxOutputTokens(tier),
          temperature: 0.6,
        },
        { signal: controller.signal }
      );

      const answer = completion.choices[0]?.message?.content?.trim() || "No response from the model.";

      try {
        await incrementAiUsage(user.id, user.email);
      } catch (usageErr) {
        console.error("AI usage increment failed (answer still returned):", usageErr);
      }

      return NextResponse.json({
        answer,
        provider: provider.label,
        usage: {
          aiQuestionsToday: account.usage.aiQuestionsToday + 1,
          aiLimit: account.usage.aiLimit,
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Chat API error:", error);
    const { status, body } = mapChatApiError(error);
    return NextResponse.json(body, { status });
  }
}
