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

function parseWhatsApp(text: string) {
  const messages: ParsedMessage[] = [];
  const bracketed =
    /\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s([^:]+):\s([\s\S]*?)(?=\[\d{1,2}\/\d{1,2}\/\d{2,4},|\d{1,2}\/\d{1,2}\/\d{2,4},|$)/gi;
  const plain =
    /(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s?[AP]M)?)\s-([^:]+):\s([\s\S]*?)(?=\d{1,2}\/\d{1,2}\/\d{2,4},|\d{1,2}:\d{2}|$)/gi;

  for (const re of [bracketed, plain]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      pushMessage(messages, {
        date: match[1],
        time: match[2],
        sender: match[3].trim(),
        message: match[4].trim(),
      });
    }
  }
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
export const MAX_IMPORT_MESSAGES = 12_000;

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

  return {
    senders,
    totalMessages: messages.length,
    avgMessageLength: messages.length ? Math.round(totalChars / messages.length) : 0,
    bySender,
  };
}
