import { NextResponse } from "next/server";
import { resolveAiProvider, systemPromptForUseCase } from "@/lib/ai-provider";
import { resolveAccount, incrementAiUsage } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, premiumContactEmail } from "@/lib/supabase/config";
import { getLimits } from "@/lib/tiers";

const MAX_QUESTION_CHARS = 2000;
const MAX_BODY_BYTES = 8_000_000;

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request too large. Premium removes import caps — contact us if you need help." },
        { status: 413 }
      );
    }

    const body = await req.json();
    const messages = body.messages;
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const useCase = typeof body.useCase === "string" ? body.useCase : undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No chat messages provided." }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: "Ask a question about this thread." }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_CHARS) {
      return NextResponse.json({ error: "Question is too long." }, { status: 400 });
    }

    let account = null;
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) {
          return NextResponse.json(
            { error: "Sign in to use AI questions (free tier includes 30 per day)." },
            { status: 401 }
          );
        }
        account = await resolveAccount(user.id, user.email);
        if (!account.usage.canAskAi) {
          return NextResponse.json(
            {
              error: `You've used your ${account.usage.aiLimit} free AI questions for today. Request Premium for unlimited questions and full chat imports.`,
              code: "quota_exceeded",
              premiumContact: premiumContactEmail(),
            },
            { status: 429 }
          );
        }
      }
    }

    const provider = resolveAiProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "AI is not configured on the server. Add XAI_API_KEY in Vercel env." },
        { status: 503 }
      );
    }

    const tier = account?.isPremium ? "premium" : "free";
    const maxContext = getLimits(tier).maxContextMessages;
    const slice = messages.slice(-maxContext);
    const context = slice
      .map((m: { sender: string; message: string }) => `${m.sender}: ${m.message}`)
      .join("\n");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    try {
      const completion = await provider.client.chat.completions.create(
        {
          model: provider.model,
          messages: [
            { role: "system", content: systemPromptForUseCase(useCase) },
            {
              role: "user",
              content: `Chat transcript (recent messages):\n${context}\n\nQuestion: ${question}`,
            },
          ],
          max_tokens: account?.isPremium ? 1200 : 700,
          temperature: 0.6,
        },
        { signal: controller.signal }
      );

      const answer = completion.choices[0]?.message?.content?.trim() || "No response from the model.";

      if (account && !account.isPremium) {
        await incrementAiUsage(account.userId, account.email);
      }

      return NextResponse.json({
        answer,
        provider: provider.label,
        usage: account
          ? {
              aiQuestionsToday: account.usage.aiQuestionsToday + (account.isPremium ? 0 : 1),
              aiLimit: account.usage.aiLimit,
            }
          : undefined,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "AI request timed out. Try a shorter question." }, { status: 504 });
    }
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to get an answer. Try again in a moment." }, { status: 500 });
  }
}
