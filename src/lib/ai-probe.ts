import { resolveAiProvider } from "./ai-provider";
import { mapChatApiError, type ChatApiErrorBody } from "./chat-api-errors";

export type AiProbeResult = {
  configured: boolean;
  provider: string | null;
  model: string | null;
  ok: boolean;
  httpStatus?: number;
  error?: string;
  detail?: string;
  code?: ChatApiErrorBody["code"] | "ai_ok";
};

/** Minimal xAI/Groq call to verify server credentials (no user thread data). */
export async function probeAiProvider(): Promise<AiProbeResult> {
  const provider = resolveAiProvider();
  if (!provider) {
    return {
      configured: false,
      provider: null,
      model: null,
      ok: false,
      code: "ai_not_configured",
      error: "No AZURE_OPENAI_*, XAI_API_KEY, or GROQ_API_KEY on the server.",
    };
  }

  try {
    await provider.client.chat.completions.create({
      model: provider.model,
      messages: [{ role: "user", content: "Reply with exactly: ok" }],
      max_tokens: 5,
      temperature: 0,
    });
    return {
      configured: true,
      provider: provider.label,
      model: provider.model,
      ok: true,
      code: "ai_ok",
    };
  } catch (error) {
    const { status, body } = mapChatApiError(error);
    return {
      configured: true,
      provider: provider.label,
      model: provider.model,
      ok: false,
      httpStatus: status,
      error: body.error,
      detail: body.detail,
      code: body.code,
    };
  }
}
