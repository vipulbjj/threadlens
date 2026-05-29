import { NextResponse } from "next/server";
import { resolveAiProvider, systemPromptForUseCase } from "@/lib/ai-provider";

const MAX_MESSAGES = 400;
const MAX_QUESTION_CHARS = 2000;
const MAX_BODY_BYTES = 2_000_000;

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large. Try a smaller export or fewer messages." }, { status: 413 });
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

    const provider = resolveAiProvider();
    if (!provider) {
      return NextResponse.json(
        {
          error:
            "AI is not configured on the server. Add GROQ_API_KEY (free tier at console.groq.com) or XAI_API_KEY in Vercel env.",
        },
        { status: 503 }
      );
    }

    const slice = messages.slice(-MAX_MESSAGES);
    const context = slice
      .map((m: { sender: string; message: string }) => `${m.sender}: ${m.message}`)
      .join("\n");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

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
          max_tokens: 700,
          temperature: 0.6,
        },
        { signal: controller.signal }
      );

      const answer = completion.choices[0]?.message?.content?.trim() || "No response from the model.";
      return NextResponse.json({ answer, provider: provider.label });
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
