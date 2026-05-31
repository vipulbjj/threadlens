import OpenAI from "openai";

export type ChatApiErrorBody = { error: string; detail?: string; code?: string };

/** Map thrown errors to HTTP status + user-facing message for /api/chat. */
export function mapChatApiError(error: unknown): { status: number; body: ChatApiErrorBody } {
  if (error instanceof Error && error.name === "AbortError") {
    return { status: 504, body: { error: "AI request timed out. Try a shorter question." } };
  }

  if (error instanceof OpenAI.APIError) {
    const detail = (error.message ?? "Provider error").slice(0, 200);
    if (error.status === 429) {
      return {
        status: 429,
        body: { error: "AI is busy right now — wait a moment and try again.", detail },
      };
    }
    if (error.status === 401 || error.status === 403) {
      return {
        status: 503,
        body: { error: "AI credentials invalid on the server. Contact support.", detail },
      };
    }
    if (error.status === 404 || /model|does not exist|deprecated|not found/i.test(detail)) {
      return {
        status: 503,
        body: {
          error: "AI model misconfigured on the server — check XAI_MODEL in Vercel.",
          detail,
        },
      };
    }
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return {
        status: 502,
        body: { error: "AI provider temporarily unavailable. Try again in a moment.", detail },
      };
    }
    return {
      status: 500,
      body: { error: "Failed to get an answer. Try again in a moment.", detail },
    };
  }

  const msg =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
  const detail = msg.slice(0, 200);

  if (/timed out|timeout|FUNCTION_INVOCATION|execution duration|wall clock/i.test(msg)) {
    return {
      status: 504,
      body: { error: "AI request timed out. Try a shorter or simpler question.", detail },
    };
  }
  if (/model|does not exist|deprecated|not found/i.test(msg)) {
    return {
      status: 503,
      body: { error: "AI model misconfigured on the server — check XAI_MODEL in Vercel.", detail },
    };
  }

  return {
    status: 500,
    body: { error: "Failed to get an answer. Try again in a moment.", detail },
  };
}
