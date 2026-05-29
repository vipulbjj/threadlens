import { describe, expect, it } from "vitest";
import { buildThreadInsights } from "./insights";

describe("buildThreadInsights", () => {
  it("returns empty for no messages", () => {
    expect(buildThreadInsights([])).toEqual([]);
  });

  it("detects two-person balance", () => {
    const messages = [
      ...Array.from({ length: 10 }, () => ({
        date: "1/1/24",
        time: "10:00",
        sender: "Alex",
        message: "hey",
      })),
      ...Array.from({ length: 2 }, () => ({
        date: "1/1/24",
        time: "10:01",
        sender: "Sam",
        message: "ok",
      })),
    ];
    const insights = buildThreadInsights(messages, "couples");
    expect(insights.some((i) => i.id === "balance")).toBe(true);
    expect(insights.some((i) => i.id === "leader")).toBe(true);
  });

  it("flags conflict markers when present", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "I am so angry and frustrated" },
      { date: "1/1/24", time: "10:01", sender: "B", message: "whatever" },
    ];
    const insights = buildThreadInsights(messages);
    expect(insights.some((i) => i.id === "conflict")).toBe(true);
  });
});
