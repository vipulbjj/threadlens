import { describe, expect, it } from "vitest";
import { buildThreadInsights, buildFullThreadStats } from "./insights";

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

describe("buildFullThreadStats", () => {
  it("returns empty string for no messages", () => {
    expect(buildFullThreadStats([])).toBe("");
  });

  it("includes date range and message share", () => {
    const messages = [
      ...Array.from({ length: 7 }, (_, i) => ({
        date: "1/1/24",
        time: `10:0${i}`,
        sender: "Alice",
        message: "hello",
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        date: "1/2/24",
        time: `10:0${i}`,
        sender: "Bob",
        message: "hey",
      })),
    ];
    const stats = buildFullThreadStats(messages);
    expect(stats).toContain("10 messages");
    expect(stats).toContain("1/1/24");
    expect(stats).toContain("1/2/24");
    expect(stats).toContain("Alice");
    expect(stats).toContain("Bob");
    expect(stats).toContain("70%");
  });

  it("includes dismissive counts per sender", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "ok." },
      { date: "1/1/24", time: "10:01", sender: "A", message: "k." },
      { date: "1/1/24", time: "10:02", sender: "B", message: "sounds great" },
    ];
    const stats = buildFullThreadStats(messages);
    expect(stats).toContain("Short/dismissive");
    expect(stats).toContain("A 2");
  });

  it("includes avg reply gap when timestamps are parseable", () => {
    // Alternate Alice/Bob with ~30 min gaps for Bob, ~1 min gaps for Alice
    const messages = [
      { date: "1/1/2024", time: "10:00 AM", sender: "Alice", message: "hey" },
      { date: "1/1/2024", time: "10:30 AM", sender: "Bob", message: "hey back" },
      { date: "1/1/2024", time: "10:31 AM", sender: "Alice", message: "cool" },
      { date: "1/1/2024", time: "11:01 AM", sender: "Bob", message: "yep" },
      { date: "1/1/2024", time: "11:02 AM", sender: "Alice", message: "nice" },
      { date: "1/1/2024", time: "11:32 AM", sender: "Bob", message: "ok" },
    ];
    const stats = buildFullThreadStats(messages);
    expect(stats).toContain("Avg reply gap");
    expect(stats).toContain("Bob");
  });

  it("stays under 600 chars for a normal chat", () => {
    const messages = Array.from({ length: 1000 }, (_, i) => ({
      date: "1/1/24",
      time: "10:00",
      sender: i % 3 === 0 ? "Alice" : "Bob",
      message: "hello there",
    }));
    const stats = buildFullThreadStats(messages);
    expect(stats.length).toBeLessThanOrEqual(600);
  });
});
