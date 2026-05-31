import { describe, expect, it } from "vitest";
import { buildThreadInsights, buildFullThreadStats } from "./insights";
import type { ParsedMessage } from "./parser";

// ─── helpers ─────────────────────────────────────────────────────────────────

function msgs(
  pairs: Array<[string, string, string, string]> // [date, time, sender, message]
): ParsedMessage[] {
  return pairs.map(([date, time, sender, message]) => ({ date, time, sender, message }));
}

// ─── buildThreadInsights ──────────────────────────────────────────────────────

describe("buildThreadInsights", () => {
  it("returns empty for no messages", () => {
    expect(buildThreadInsights([])).toEqual([]);
  });

  it("detects two-person balance", () => {
    const messages = [
      ...Array.from({ length: 10 }, () => ({ date: "1/1/24", time: "10:00", sender: "Alex", message: "hey" })),
      ...Array.from({ length: 2 }, () => ({ date: "1/1/24", time: "10:01", sender: "Sam", message: "ok" })),
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

  // ── Reply speed ──────────────────────────────────────────────────────────

  it("includes reply speed when timestamps parse", () => {
    const messages = msgs([
      ["1/1/2024", "10:00 AM", "Alice", "hey"],
      ["1/1/2024", "10:30 AM", "Bob", "hey back"],
      ["1/1/2024", "10:31 AM", "Alice", "cool"],
      ["1/1/2024", "11:01 AM", "Bob", "yep"],
      ["1/1/2024", "11:02 AM", "Alice", "nice"],
      ["1/1/2024", "11:32 AM", "Bob", "ok"],
    ]);
    const insights = buildThreadInsights(messages, "couples");
    expect(insights.some((i) => i.id === "replyspeed")).toBe(true);
  });

  // ── Initiation ───────────────────────────────────────────────────────────

  it("detects conversation initiation imbalance", () => {
    // Alice initiates 5 times (after 6h+ gaps), Bob only once
    const messages: ParsedMessage[] = [];
    for (let day = 0; day < 6; day++) {
      const initiator = day === 5 ? "Bob" : "Alice";
      messages.push({ date: `1/${day + 1}/2024`, time: "09:00 AM", sender: initiator, message: "hey" });
      messages.push({ date: `1/${day + 1}/2024`, time: "09:05 AM", sender: initiator === "Alice" ? "Bob" : "Alice", message: "hi!" });
    }
    const insights = buildThreadInsights(messages, "couples");
    expect(insights.some((i) => i.id === "initiation")).toBe(true);
    const init = insights.find((i) => i.id === "initiation")!;
    expect(init.detail).toMatch(/Alice/);
  });

  // ── Couples-specific ─────────────────────────────────────────────────────

  it("couples: shows warmth markers", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "I love you" },
      { date: "1/1/24", time: "10:01", sender: "B", message: "miss you so much" },
      { date: "1/1/24", time: "10:02", sender: "A", message: "hey" },
    ];
    const insights = buildThreadInsights(messages, "couples");
    expect(insights.some((i) => i.id === "warmth")).toBe(true);
  });

  it("couples: shows late-night insight when present", () => {
    const messages = [
      { date: "1/1/24", time: "11:30 PM", sender: "A", message: "we need to talk" },
      { date: "1/1/24", time: "11:35 PM", sender: "B", message: "now?" },
      ...Array.from({ length: 8 }, (_, i) => ({
        date: "1/1/24",
        time: "10:00 AM",
        sender: i % 2 === 0 ? "A" : "B",
        message: "hello",
      })),
    ];
    const insights = buildThreadInsights(messages, "couples");
    expect(insights.some((i) => i.id === "latenight")).toBe(true);
  });

  it("couples: includes disclaimer", () => {
    const messages = [{ date: "1/1/24", time: "10:00", sender: "A", message: "hey" }];
    const insights = buildThreadInsights(messages, "couples");
    expect(insights.some((i) => i.id === "disclaimer")).toBe(true);
  });

  // ── Friends-specific ─────────────────────────────────────────────────────

  it("friends: detects plan-making language", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "let's grab dinner this Friday!" },
      { date: "1/1/24", time: "10:01", sender: "B", message: "sounds good, wanna meet at 7?" },
      { date: "1/1/24", time: "10:02", sender: "A", message: "perfect" },
    ];
    const insights = buildThreadInsights(messages, "friends");
    expect(insights.some((i) => i.id === "plans")).toBe(true);
    const plan = insights.find((i) => i.id === "plans")!;
    expect(plan.detail).not.toMatch(/No concrete/);
  });

  it("friends: flags no plan language", () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      date: "1/1/24",
      time: "10:00",
      sender: i % 2 === 0 ? "A" : "B",
      message: "haha yeah",
    }));
    const insights = buildThreadInsights(messages, "friends");
    const plan = insights.find((i) => i.id === "plans");
    expect(plan).toBeTruthy();
    expect(plan!.detail).toMatch(/No concrete/);
  });

  it("friends: detects ghost/silence periods", () => {
    const messages = msgs([
      ["1/1/2024", "10:00", "Alice", "hey"],
      // 10-day gap — Alice went quiet
      ["1/11/2024", "10:00", "Bob", "everything ok?"],
    ]);
    const insights = buildThreadInsights(messages, "friends");
    expect(insights.some((i) => i.id === "ghost")).toBe(true);
  });

  // ── Family-specific ──────────────────────────────────────────────────────

  it("family: shows warmth markers", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "Mom", message: "I love you!" },
      { date: "1/1/24", time: "10:01", sender: "You", message: "love you too" },
    ];
    const insights = buildThreadInsights(messages, "family");
    expect(insights.some((i) => i.id === "warmth")).toBe(true);
  });

  it("family: detects check-in language", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "Mom", message: "how are you doing?" },
      { date: "1/1/24", time: "10:01", sender: "You", message: "good, thanks" },
      { date: "1/2/24", time: "10:00", sender: "Mom", message: "hope you're well!" },
    ];
    const insights = buildThreadInsights(messages, "family");
    expect(insights.some((i) => i.id === "checkin")).toBe(true);
    const checkin = insights.find((i) => i.id === "checkin")!;
    expect(checkin.detail).toMatch(/Mom/);
  });

  it("family: detects encouragement language", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "Dad", message: "proud of you, well done!" },
      { date: "1/1/24", time: "10:01", sender: "You", message: "thanks Dad" },
    ];
    const insights = buildThreadInsights(messages, "family");
    expect(insights.some((i) => i.id === "encourage")).toBe(true);
  });

  // ── Work-specific ────────────────────────────────────────────────────────

  it("work: counts after-hours messages", () => {
    const messages = [
      { date: "1/1/24", time: "08:00 PM", sender: "Boss", message: "can you do this tonight?" },
      { date: "1/1/24", time: "08:30 PM", sender: "You", message: "sure" },
      { date: "1/2/24", time: "10:00 AM", sender: "Boss", message: "meeting at 11" },
      { date: "1/2/24", time: "10:05 AM", sender: "You", message: "ok" },
    ];
    const insights = buildThreadInsights(messages, "work");
    expect(insights.some((i) => i.id === "afterhours")).toBe(true);
    const ah = insights.find((i) => i.id === "afterhours")!;
    expect(ah.detail).toMatch(/\d+/);
  });

  it("work: detects weekend messages", () => {
    // 2024-01-06 is a Saturday
    const messages = [
      { date: "1/6/2024", time: "11:00 AM", sender: "Boss", message: "quick question" },
      { date: "1/6/2024", time: "11:05 AM", sender: "You", message: "ok" },
    ];
    const insights = buildThreadInsights(messages, "work");
    expect(insights.some((i) => i.id === "weekend")).toBe(true);
  });

  it("work: detects urgency language", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "Boss", message: "need this ASAP" },
      { date: "1/1/24", time: "10:01", sender: "Boss", message: "it's urgent please respond" },
      { date: "1/1/24", time: "10:02", sender: "You", message: "on it" },
    ];
    const insights = buildThreadInsights(messages, "work");
    expect(insights.some((i) => i.id === "urgency")).toBe(true);
  });

  // ── Reflection-specific ──────────────────────────────────────────────────

  it("reflection: detects enthusiasm asymmetry", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "omg that sounds amazing!!" },
      { date: "1/1/24", time: "10:01", sender: "A", message: "hahaha yess!!" },
      { date: "1/1/24", time: "10:02", sender: "A", message: "😍😍😍" },
      { date: "1/1/24", time: "10:03", sender: "B", message: "yeah cool" },
      { date: "1/1/24", time: "10:04", sender: "B", message: "ok" },
    ];
    const insights = buildThreadInsights(messages, "reflection");
    expect(insights.some((i) => i.id === "enthusiasm")).toBe(true);
  });

  it("reflection: shows affection markers as warmth", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "I miss you so much" },
      { date: "1/1/24", time: "10:01", sender: "B", message: "same" },
    ];
    const insights = buildThreadInsights(messages, "reflection");
    expect(insights.some((i) => i.id === "warmth")).toBe(true);
  });

  it("reflection: includes a reminder disclaimer", () => {
    const messages = [{ date: "1/1/24", time: "10:00", sender: "A", message: "hey" }];
    const insights = buildThreadInsights(messages, "reflection");
    expect(insights.some((i) => i.id === "disclaimer")).toBe(true);
  });

  // ── General-specific ─────────────────────────────────────────────────────

  it("general: includes message depth insight", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "This is a very long message with lots of words and detail." },
      { date: "1/1/24", time: "10:01", sender: "B", message: "ok" },
      { date: "1/1/24", time: "10:02", sender: "A", message: "Another detailed message about things and stuff." },
      { date: "1/1/24", time: "10:03", sender: "B", message: "k" },
    ];
    const insights = buildThreadInsights(messages, "general");
    expect(insights.some((i) => i.id === "msglength")).toBe(true);
  });
});

// ─── buildFullThreadStats ─────────────────────────────────────────────────────

describe("buildFullThreadStats", () => {
  it("returns empty string for no messages", () => {
    expect(buildFullThreadStats([])).toBe("");
  });

  it("includes date range and message share", () => {
    const messages = [
      ...Array.from({ length: 7 }, (_, i) => ({ date: "1/1/24", time: `10:0${i}`, sender: "Alice", message: "hello" })),
      ...Array.from({ length: 3 }, (_, i) => ({ date: "1/2/24", time: `10:0${i}`, sender: "Bob", message: "hey" })),
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
    const messages = msgs([
      ["1/1/2024", "10:00 AM", "Alice", "hey"],
      ["1/1/2024", "10:30 AM", "Bob", "hey back"],
      ["1/1/2024", "10:31 AM", "Alice", "cool"],
      ["1/1/2024", "11:01 AM", "Bob", "yep"],
      ["1/1/2024", "11:02 AM", "Alice", "nice"],
      ["1/1/2024", "11:32 AM", "Bob", "ok"],
    ]);
    const stats = buildFullThreadStats(messages);
    expect(stats).toContain("Avg reply gap");
    expect(stats).toContain("Bob");
  });

  it("includes conversation initiation counts", () => {
    const messages: ParsedMessage[] = [];
    for (let day = 0; day < 4; day++) {
      messages.push({ date: `1/${day + 1}/2024`, time: "09:00 AM", sender: "Alice", message: "morning!" });
      messages.push({ date: `1/${day + 1}/2024`, time: "09:05 AM", sender: "Bob", message: "hey" });
    }
    const stats = buildFullThreadStats(messages);
    expect(stats).toContain("Conversation starts");
    expect(stats).toContain("Alice");
  });

  it("includes work-specific stats when useCase is work", () => {
    const messages = [
      { date: "1/1/24", time: "08:00 PM", sender: "Boss", message: "done?" },
      { date: "1/6/2024", time: "10:00 AM", sender: "You", message: "working on it" },
      { date: "1/1/24", time: "10:00 AM", sender: "Boss", message: "need this ASAP" },
    ];
    const stats = buildFullThreadStats(messages, "work");
    expect(stats).toContain("After-hours");
    expect(stats).toContain("Weekends");
    expect(stats).toContain("Urgency");
  });

  it("includes friends-specific plan stats", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "let's meet for dinner!" },
      { date: "1/1/24", time: "10:01", sender: "B", message: "yes Friday works" },
    ];
    const stats = buildFullThreadStats(messages, "friends");
    expect(stats).toContain("Plan signals");
  });

  it("includes family check-in and encouragement stats", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "Mom", message: "how are you doing sweetie?" },
      { date: "1/1/24", time: "10:01", sender: "Mom", message: "proud of you!" },
      { date: "1/1/24", time: "10:02", sender: "You", message: "thanks mom" },
    ];
    const stats = buildFullThreadStats(messages, "family");
    expect(stats).toContain("Check-in");
    expect(stats).toContain("Encouragement");
  });

  it("includes enthusiasm markers for reflection", () => {
    const messages = [
      { date: "1/1/24", time: "10:00", sender: "A", message: "omg yes!!" },
      { date: "1/1/24", time: "10:01", sender: "B", message: "cool" },
    ];
    const stats = buildFullThreadStats(messages, "reflection");
    expect(stats).toContain("Enthusiasm");
  });

  it("stays under 700 chars", () => {
    const messages = Array.from({ length: 1000 }, (_, i) => ({
      date: "1/1/24",
      time: "10:00",
      sender: i % 3 === 0 ? "Alice" : "Bob",
      message: "hello there",
    }));
    const stats = buildFullThreadStats(messages);
    expect(stats.length).toBeLessThanOrEqual(700);
  });
});
