import { describe, expect, it } from "vitest";
import { formatAiQuotaCompact, formatAiQuotaDetail, aiQuestionsRemaining } from "./usage-copy";

describe("usage-copy", () => {
  it("computes remaining", () => {
    expect(aiQuestionsRemaining(2, 30)).toBe(28);
    expect(aiQuestionsRemaining(30, 30)).toBe(0);
  });

  it("compact copy names questions and limit", () => {
    expect(formatAiQuotaCompact(2, 30)).toBe("28 of 30 AI questions left today");
    expect(formatAiQuotaCompact(30, 30)).toBe("No AI questions left today");
  });

  it("detail copy is a full sentence", () => {
    expect(formatAiQuotaDetail(2, 30)).toContain("2 of 30");
    expect(formatAiQuotaDetail(2, 30)).toContain("28 remaining");
    expect(formatAiQuotaDetail(2, 30)).toContain("midnight UTC");
  });
});
