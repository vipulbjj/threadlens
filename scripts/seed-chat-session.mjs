/**
 * Build a minimal persisted Zustand payload for browser E2E (inject via DevTools).
 * Usage: node scripts/seed-chat-session.mjs [path-to-export.txt] [maxMessages]
 */
import { readFileSync, writeFileSync } from "fs";
import { parseUniversalChat } from "../src/lib/parser.ts";
import { capMessagesForTier } from "../src/lib/tiers.ts";

const path = process.argv[2] || `${process.env.HOME}/Downloads/WhatsApp Exports/_chat 2.txt`;
const max = Number(process.argv[3] || 35000);

const text = readFileSync(path, "utf8");
const all = parseUniversalChat(text, "whatsapp");
const { messages } = capMessagesForTier(all, "premium");
const trimmed = messages.length > max ? messages.slice(-max) : messages;

const id = "session-e2e-chat2";
const payload = {
  state: {
    sessions: [
      {
        id,
        name: "_chat 2",
        platform: "whatsapp",
        messages: trimmed,
        importedAt: new Date().toISOString(),
        useCase: "couples",
      },
    ],
    activeSessionId: id,
  },
  version: 0,
};

const out = "/tmp/threadlens-sessions.json";
writeFileSync(out, JSON.stringify(payload));
console.log(
  JSON.stringify({
    out,
    parsed: all.length,
    stored: trimmed.length,
    chatUrl: `http://localhost:3000/chat/${id}`,
  })
);
