import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { resolveAiProvider } from "./ai-provider";

describe("resolveAiProvider", () => {
  const env = process.env;

  beforeEach(() => {
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("XAI_MODEL", "");
  });

  afterEach(() => {
    process.env = env;
    vi.unstubAllEnvs();
  });

  it("defaults to grok-4.20 slug (dot, not grok-4-20)", () => {
    vi.stubEnv("XAI_API_KEY", "test-key");
    const provider = resolveAiProvider();
    expect(provider?.model).toBe("grok-4.20-0309-non-reasoning");
  });
});
