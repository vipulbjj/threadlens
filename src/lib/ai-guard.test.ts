import { describe, expect, it } from "vitest";
import { buildBoundedContext, sliceMessagesForAiPayload } from "./ai-guard";

describe("buildBoundedContext", () => {
  it("truncates long messages and total context for free tier", () => {
    const messages = Array.from({ length: 600 }, () => ({
      sender: "A",
      message: "x".repeat(500),
    }));
    const { context, truncated } = buildBoundedContext(messages, "free");
    expect(truncated).toBe(true);
    expect(context.length).toBeLessThanOrEqual(28_500);
    expect(context).not.toContain("x".repeat(500));
  });

  it("sliceMessagesForAiPayload keeps only recent messages for the HTTP body", () => {
    const messages = Array.from({ length: 35_000 }, (_, i) => ({
      sender: "A",
      message: `msg ${i}`,
    }));
    const slice = sliceMessagesForAiPayload(messages, "free");
    expect(slice).toHaveLength(500);
    expect(slice[0].message).toBe("msg 34500");
    expect(JSON.stringify(slice).length).toBeLessThan(500_000);
  });
});
