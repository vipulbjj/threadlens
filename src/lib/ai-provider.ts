import OpenAI from "openai";

export type AiProviderId = "groq" | "xai" | "none";

export interface ResolvedAiProvider {
  id: AiProviderId;
  client: OpenAI;
  model: string;
  label: string;
}

/** Prefer xAI (your credits), then optional Groq. Set keys in Vercel env. */
export function resolveAiProvider(): ResolvedAiProvider | null {
  const xaiKey = process.env.XAI_API_KEY?.trim();
  if (xaiKey) {
    return {
      id: "xai",
      client: new OpenAI({ apiKey: xaiKey, baseURL: "https://api.x.ai/v1" }),
      model: process.env.XAI_MODEL?.trim() || "grok-4-20-0309-non-reasoning",
      label: "xAI",
    };
  }

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      id: "groq",
      client: new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" }),
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
      label: "Groq",
    };
  }

  return null;
}

export function systemPromptForUseCase(useCase?: string) {
  const base =
    "You help people understand chat exports: communication patterns, emotional tone, repair attempts, and practical next steps. Be direct, kind, and neutral — never take sides in relationship conflicts. Never claim to be a therapist, lawyer, or crisis counselor. If someone may be unsafe, suggest professional or crisis resources. Use evidence from the transcript; cite who said what when helpful. Keep answers under 400 words unless asked for more.";

  if (useCase === "couples") {
    return (
      base +
      " Focus on de-escalation, mutual understanding, and fair communication — not blame. Suggest constructive next messages when asked."
    );
  }
  if (useCase === "work") {
    return base + " Focus on boundaries and professional tone; do not advise violating workplace policies.";
  }
  return base;
}
