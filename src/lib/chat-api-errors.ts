import OpenAI from "openai";

export type ChatApiErrorCode =
  | "ai_timeout"
  | "ai_not_configured"
  | "xai_auth"
  | "xai_quota"
  | "xai_model"
  | "xai_unavailable"
  | "ai_failed";

export type ChatApiErrorBody = {
  error: string;
  detail?: string;
  code?: ChatApiErrorCode;
};

/** Map thrown errors to HTTP status + user-facing message for /api/chat. */
export function mapChatApiError(error: unknown): { status: number; body: ChatApiErrorBody } {
  if (error instanceof Error && error.name === "AbortError") {
    return {
      status: 504,
      body: { error: "AI request timed out. Try a shorter question.", code: "ai_timeout" },
    };
  }

  if (error instanceof OpenAI.APIError) {
    const detail = (error.message ?? "Provider error").slice(0, 200);
    if (error.status === 429) {
      return {
        status: 429,
        body: {
          error: "AI is busy right now — wait a moment and try again.",
          detail,
          code: "xai_quota",
        },
      };
    }
    if (error.status === 401 || error.status === 403) {
      const creditsOrSub = /credit|subscription|billing|quota|permission|ACL/i.test(detail);
      return {
        status: 503,
        body: {
          error: creditsOrSub
            ? "xAI rejected the request (credits, subscription, or API key permissions). Check console.x.ai billing and your Vercel XAI_API_KEY."
            : "AI credentials invalid on the server. Regenerate XAI_API_KEY in Vercel and redeploy.",
          detail,
          code: "xai_auth",
        },
      };
    }
    if (error.status === 404 || /model|deployment|does not exist|deprecated|not found/i.test(detail)) {
      return {
        status: 503,
        body: {
          error:
            "AI model or deployment misconfigured — check AZURE_OPENAI_DEPLOYMENT or XAI_MODEL in Vercel.",
          detail,
          code: "xai_model",
        },
      };
    }
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return {
        status: 502,
        body: {
          error: "AI provider temporarily unavailable. Try again in a moment.",
          detail,
          code: "xai_unavailable",
        },
      };
    }
    return {
      status: 500,
      body: { error: "Failed to get an answer. Try again in a moment.", detail, code: "ai_failed" },
    };
  }

  const msg =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
  const detail = msg.slice(0, 200);

  if (/timed out|timeout|FUNCTION_INVOCATION|execution duration|wall clock/i.test(msg)) {
    return {
      status: 504,
      body: {
        error: "AI request timed out. Try a shorter or simpler question.",
        detail,
        code: "ai_timeout",
      },
    };
  }
  if (/model|does not exist|deprecated|not found/i.test(msg)) {
    return {
      status: 503,
      body: {
        error: "AI model misconfigured on the server — check XAI_MODEL in Vercel.",
        detail,
        code: "xai_model",
      },
    };
  }
  if (/bad credentials|unauthenticated|invalid api key|incorrect api key/i.test(msg)) {
    return {
      status: 503,
      body: {
        error: "AI credentials invalid on the server. Regenerate XAI_API_KEY in Vercel and redeploy.",
        detail,
        code: "xai_auth",
      },
    };
  }

  return {
    status: 500,
    body: { error: "Failed to get an answer. Try again in a moment.", detail, code: "ai_failed" },
  };
}
