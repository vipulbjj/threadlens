import { describe, expect, it } from "vitest";
import { buildBoundedContext } from "./ai-guard";

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
});
