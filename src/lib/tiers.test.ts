import { describe, expect, it } from "vitest";
import { capMessagesForTier, getLimits } from "./tiers";

describe("tiers", () => {
  it("free tier caps imports at 12k", () => {
    const msgs = Array.from({ length: 20_000 }, (_, i) => ({ i }));
    const { messages, truncated, originalCount } = capMessagesForTier(msgs, "free");
    expect(truncated).toBe(true);
    expect(originalCount).toBe(20_000);
    expect(messages).toHaveLength(12_000);
  });

  it("premium tier does not cap imports", () => {
    const msgs = Array.from({ length: 20_000 }, (_, i) => ({ i }));
    const { truncated, messages } = capMessagesForTier(msgs, "premium");
    expect(truncated).toBe(false);
    expect(messages).toHaveLength(20_000);
  });

  it("free tier has finite AI limit", () => {
    expect(getLimits("free").maxAiQuestionsPerDay).toBe(12);
    expect(Number.isFinite(getLimits("premium").maxAiQuestionsPerDay)).toBe(false);
  });
});
