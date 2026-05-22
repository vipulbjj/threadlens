import { NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_MESSAGES = 400;
const MAX_QUESTION_CHARS = 2000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No chat messages provided." }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: "Ask a question about this thread." }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_CHARS) {
      return NextResponse.json({ error: "Question is too long." }, { status: 400 });
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI is not configured. Add XAI_API_KEY to .env (see README)." },
        { status: 503 }
      );
    }

    const slice = messages.slice(-MAX_MESSAGES);
    const context = slice
      .map((m: { sender: string; message: string }) => `${m.sender}: ${m.message}`)
      .join("\n");

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });

    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content:
            "You help people understand chat exports: communication patterns, emotional tone, red flags, and practical next steps. Be direct, kind, and never claim to be a therapist or lawyer. If the user asks who texts more, use the message counts in the transcript.",
        },
        { role: "user", content: `Chat transcript (recent messages):\n${context}\n\nQuestion: ${question}` },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || "No response from the model.";
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to get an answer from the AI." }, { status: 500 });
  }
}
