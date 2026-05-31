import type { ChatPlatform } from "./store";
import { capMessagesForTier, type AccountTier } from "./tiers";

export interface ParsedMessage {
  date: string;
  time: string;
  sender: string;
  message: string;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

const SKIP_SNIPPETS = [
  "Messages and calls are end-to-end encrypted",
  "<Media omitted>",
  "image omitted",
  "video omitted",
  "audio omitted",
  "sticker omitted",
];

function shouldSkipMessage(message: string) {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return SKIP_SNIPPETS.some((s) => trimmed.includes(s));
}

function pushMessage(messages: ParsedMessage[], row: ParsedMessage) {
  if (shouldSkipMessage(row.message)) return;
  messages.push(row);
}

export function parseUniversalChat(text: string, platform: ChatPlatform = "whatsapp"): ParsedMessage[] {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new ParseError("The file looks empty. Export your chat again and re-upload.");
  }

  const messages: ParsedMessage[] = [];

  if (platform === "telegram") {
    const telegram = parseTelegram(trimmed);
    if (telegram.length > 0) return telegram;
  }

  if (platform === "whatsapp" || platform === "imessage") {
    const wa = parseWhatsApp(trimmed);
    if (wa.length > 0) return wa;
  }

  const generic = parseGeneric(trimmed);
  if (generic.length > 0) return generic;

  if (platform === "telegram") {
    throw new ParseError(
      "Could not read this Telegram export. Try JSON from Telegram Desktop, or a .txt export with lines like: [date time] Name: message"
    );
  }
  if (platform === "imessage") {
    throw new ParseError(
      "Could not read this iMessage export. Export the thread as .txt (one line per message with sender names), then try again."
    );
  }
  throw new ParseError(
    "Could not find messages in this file. For WhatsApp: Export chat → Without media → .txt. Then drop that file here."
  );
}

/** WhatsApp lines always start with a date stamp; continuation lines do not. */
const WA_BRACKET_LINE =
  /^\u200e?\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s([^:]+):\s(.*)$/i;
const WA_PLAIN_LINE =
  /^\u200e?(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s-\s([^:]+):\s(.*)$/i;

function parseWhatsApp(text: string) {
  const messages: ParsedMessage[] = [];
  let current: ParsedMessage | null = null;
  /** Stick to the export's native line format so pasted/forwarded snippets in the other format stay in the same bubble. */
  let exportFormat: "bracket" | "plain" | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const bracket = line.match(WA_BRACKET_LINE);
    const plain = !bracket ? line.match(WA_PLAIN_LINE) : null;

    const isBracketHeader = Boolean(bracket);
    const isPlainHeader = Boolean(plain);
    const header = bracket ?? plain;

    if (header) {
      const lineFormat = isBracketHeader ? "bracket" : "plain";
      if (exportFormat === null) exportFormat = lineFormat;

      const countsAsNewMessage = lineFormat === exportFormat;
      if (countsAsNewMessage) {
        if (current) pushMessage(messages, current);
        current = {
          date: header[1],
          time: header[2],
          sender: header[3].trim(),
          message: (header[4] ?? "").trim(),
        };
        continue;
      }
      // Other-format line inside a message (e.g. forwarded chat snippet) — append below.
    }

    if (current && line.length > 0) {
      current.message = current.message ? `${current.message}\n${line}` : line;
    } else if (!header && line.length > 0 && !current) {
      // Preamble lines before the first message (export header) — ignore.
    }
  }
  if (current) pushMessage(messages, current);
  return messages;
}

function parseTelegram(text: string) {
  const messages: ParsedMessage[] = [];

  try {
    const jsonParsed = JSON.parse(text);
    if (jsonParsed.messages && Array.isArray(jsonParsed.messages)) {
      for (const m of jsonParsed.messages) {
        if (m.type === "message" && typeof m.text === "string" && m.text.trim()) {
          const dateObj = new Date(m.date);
          pushMessage(messages, {
            date: dateObj.toLocaleDateString(),
            time: dateObj.toLocaleTimeString(),
            sender: m.from || "Unknown",
            message: m.text,
          });
        }
      }
      if (messages.length > 0) return messages;
    }
  } catch {
    // fall through to txt patterns
  }

  const tgTxt =
    /\[?(\d{1,2}[./]\d{1,2}[./]\d{2,4})[\s,]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?\s+([^:]+):\s+([\s\S]*?)(?=\[|\d{1,2}[./]\d{1,2}[./]\d{2,4}[\s,]+\d{1,2}:\d{2}|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = tgTxt.exec(text)) !== null) {
    pushMessage(messages, {
      date: match[1],
      time: match[2],
      sender: match[3].trim(),
      message: match[4].trim(),
    });
  }

  return messages;
}

function parseGeneric(text: string) {
  const messages: ParsedMessage[] = [];
  const genericRegex =
    /\[?(?:\d{2,4}[-./]\d{1,2}[-./]\d{1,2})\s+(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?\s+([^:]+):\s+([\s\S]*?)(?=\[?(?:\d{2,4}[-./]\d{1,2}[-./]\d{1,2})\s+(?:\d{1,2}:\d{2})|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = genericRegex.exec(text)) !== null) {
    pushMessage(messages, {
      date: "Unknown date",
      time: "Unknown time",
      sender: match[1].trim(),
      message: match[2].trim(),
    });
  }
  return messages;
}

/** @deprecated Use capImportedMessages(messages, tier) */
export const MAX_IMPORT_MESSAGES = 20_000;

export function capImportedMessages(messages: ParsedMessage[], tier: AccountTier = "free") {
  return { ...capMessagesForTier(messages, tier), tier };
}

export function getChatStats(messages: ParsedMessage[]) {
  const senders = Array.from(new Set(messages.map((m) => m.sender)));
  const totalChars = messages.reduce((acc, m) => acc + m.message.length, 0);
  const bySender = senders.map((sender) => {
    const senderMsgs = messages.filter((m) => m.sender === sender);
    const sorryCount = senderMsgs.filter((m) => /\b(sorry|apologize|apologies|my bad)\b/i.test(m.message)).length;
    const senderChars = senderMsgs.reduce((acc, m) => acc + m.message.length, 0);
    return {
      sender,
      count: senderMsgs.length,
      avgLength: senderMsgs.length ? Math.round(senderChars / senderMsgs.length) : 0,
      sorryCount,
      totalChars: senderChars,
    };
  });

  const sorted = [...bySender].sort((a, b) => b.count - a.count);
  const total = messages.length;
  const topTwoCount = sorted.slice(0, 2).reduce((n, s) => n + s.count, 0);
  // 1:1 chat: two people account for ~all messages; other "senders" are parse artifacts
  // (forwarded snippets, pasted lines, contact cards) with tiny counts.
  const isOneToOne = sorted.length >= 2 && total > 0 && topTwoCount / total >= 0.98;
  const minPrimaryCount = Math.max(25, Math.round(total * 0.002));
  const primaryBySender = isOneToOne
    ? sorted.slice(0, 2)
    : sorted.filter((s) => s.count >= minPrimaryCount);
  const incidentalSenders = sorted.filter((s) => !primaryBySender.includes(s));

  return {
    senders,
    totalMessages: total,
    avgMessageLength: total ? Math.round(totalChars / total) : 0,
    bySender,
    primaryBySender,
    incidentalSenders,
    isOneToOne,
  };
}
