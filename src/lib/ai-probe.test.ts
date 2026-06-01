import { describe, expect, it, vi, beforeEach } from "vitest";
import OpenAI from "openai";

vi.mock("./ai-provider", () => ({
  resolveAiProvider: vi.fn(),
}));

import { resolveAiProvider } from "./ai-provider";
import { probeAiProvider } from "./ai-probe";

describe("probeAiProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("reports not configured when no provider", async () => {
    vi.mocked(resolveAiProvider).mockReturnValue(null);
    const r = await probeAiProvider();
    expect(r.ok).toBe(false);
    expect(r.code).toBe("ai_not_configured");
  });

  it("reports ok on successful completion", async () => {
    vi.mocked(resolveAiProvider).mockReturnValue({
      id: "xai",
      label: "xAI",
      model: "grok-test",
      client: {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: "ok" } }],
            }),
          },
        },
      },
    } as unknown as ReturnType<typeof resolveAiProvider>);

    const r = await probeAiProvider();
    expect(r.ok).toBe(true);
    expect(r.code).toBe("ai_ok");
  });

  it("maps auth errors from provider", async () => {
    vi.mocked(resolveAiProvider).mockReturnValue({
      id: "xai",
      label: "xAI",
      model: "grok-test",
      client: {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(
              new OpenAI.APIError(401, undefined, '401 "Bad credentials"', undefined)
            ),
          },
        },
      },
    } as unknown as ReturnType<typeof resolveAiProvider>);

    const r = await probeAiProvider();
    expect(r.ok).toBe(false);
    expect(r.code).toBe("xai_auth");
    expect(r.detail).toMatch(/Bad credentials/i);
  });
});
