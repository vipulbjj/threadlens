import { describe, expect, it } from "vitest";
import { capImportedMessages, parseUniversalChat, ParseError } from "./parser";

const SAMPLE = `[1/8/24, 10:15:32 AM] Alice: Hey are we still on for tonight?
[1/8/24, 10:16:01 AM] Bob: Yes! See you at 8
[1/8/24, 10:16:45 AM] Alice: Perfect`;

describe("parseUniversalChat", () => {
  it("parses bracketed WhatsApp export", () => {
    const messages = parseUniversalChat(SAMPLE, "whatsapp");
    expect(messages).toHaveLength(3);
    expect(messages[0].sender).toBe("Alice");
    expect(messages[1].message).toContain("Yes");
  });

  it("throws on empty file", () => {
    expect(() => parseUniversalChat("   ", "whatsapp")).toThrow(ParseError);
  });

  it("skips media omitted lines", () => {
    const text = `[1/1/24, 10:00:00 AM] A: Hello
[1/1/24, 10:00:01 AM] B: <Media omitted>`;
    const messages = parseUniversalChat(text, "whatsapp");
    expect(messages).toHaveLength(1);
  });

  it("parses plain WhatsApp date-time dash format", () => {
    const text = `1/8/24, 10:15 AM - Alice: Hey
1/8/24, 10:16 AM - Bob: Yes`;
    const messages = parseUniversalChat(text, "whatsapp");
    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe("Alice");
  });

  it("keeps multi-line message body as one message (no false senders)", () => {
    const text = `[1/8/24, 10:15:32 AM] Alice: Forwarded thread below
1/8/24, 9:00 AM - Josh Will: This should stay inside Alice's message
still part of the same bubble`;
    const messages = parseUniversalChat(text, "whatsapp");
    expect(messages).toHaveLength(1);
    expect(messages[0].sender).toBe("Alice");
    expect(messages[0].message).toContain("Josh Will");
  });

  it("throws helpful message for unknown blob", () => {
    expect(() => parseUniversalChat("hello world", "whatsapp")).toThrow(
      /could not find messages/i
    );
  });

  it("caps very large imports to the most recent messages", () => {
    const big = Array.from({ length: 40_000 }, (_, i) => ({
      date: "1/1/24",
      time: "10:00 AM",
      sender: "A",
      message: `msg ${i}`,
    }));
    const { messages, truncated, originalCount } = capImportedMessages(big);
    expect(truncated).toBe(true);
    expect(originalCount).toBe(40_000);
    expect(messages).toHaveLength(35_000);
    expect(messages[0].message).toBe("msg 5000");
  });
});
