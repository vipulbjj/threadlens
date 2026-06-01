import { describe, expect, it } from "vitest";
import OpenAI from "openai";
import { mapChatApiError } from "./chat-api-errors";

describe("mapChatApiError", () => {
  it("maps AbortError to 504", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    const { status, body } = mapChatApiError(err);
    expect(status).toBe(504);
    expect(body.error).toMatch(/timed out/i);
  });

  it("maps OpenAI 429 to 429", () => {
    const err = new OpenAI.APIError(429, undefined, "rate limited", undefined);
    const { status } = mapChatApiError(err);
    expect(status).toBe(429);
  });

  it("maps model-not-found to 503", () => {
    const err = new OpenAI.APIError(404, undefined, "model grok-foo does not exist", undefined);
    const { status, body } = mapChatApiError(err);
    expect(status).toBe(503);
    expect(body.error).toMatch(/misconfigured/i);
  });

  it("maps Vercel timeout strings to 504", () => {
    const { status } = mapChatApiError(new Error("FUNCTION_INVOCATION_TIMEOUT"));
    expect(status).toBe(504);
  });

  it("maps 401 to xai_auth with detail", () => {
    const err = new OpenAI.APIError(401, undefined, '401 "Bad credentials"', undefined);
    const { status, body } = mapChatApiError(err);
    expect(status).toBe(503);
    expect(body.code).toBe("xai_auth");
    expect(body.detail).toMatch(/Bad credentials/i);
  });
});
