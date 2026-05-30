import { readFileSync, existsSync } from "fs";
import { describe, expect, it } from "vitest";
import { capImportedMessages, getChatStats, parseUniversalChat } from "./parser";

const DOWNLOADS_DIR = "/Users/vipulbajaj/Downloads/WhatsApp Exports";
const RUN = process.env.INTEGRATION_DOWNLOADS === "1";

const FILES = ["_chat.txt", "_chat 2.txt", "_chat 3.txt", "_chat 4.txt"] as const;

describe.runIf(RUN)("Downloads WhatsApp exports", () => {
  for (const name of FILES) {
    it(`parses ${name}`, () => {
      const path = `${DOWNLOADS_DIR}/${name}`;
      expect(existsSync(path)).toBe(true);
      const text = readFileSync(path, "utf8");
      const messages = parseUniversalChat(text, "whatsapp");
      expect(messages.length).toBeGreaterThan(10);
      const stats = getChatStats(messages);
      expect(stats.senders.length).toBeGreaterThan(0);
      const { messages: capped, truncated } = capImportedMessages(messages);
      expect(capped.length).toBeLessThanOrEqual(20_000);
      if (messages.length > 20_000) expect(truncated).toBe(true);
    });
  }
});
