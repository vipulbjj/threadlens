import type { ParsedMessage } from "./parser";
import { getChatStats } from "./parser";
import type { UseCaseId } from "./use-cases";

const CONFLICT_WORDS =
  /\b(angry|mad|upset|fight|argue|hurt|annoyed|frustrated|whatever|fine\.|leave me|done with|toxic|always|never)\b/i;
const AFFECTION_WORDS = /\b(love you|miss you|❤|🥰|sorry|thank you|thanks|appreciate|proud)\b/i;
const DISMISSIVE = /\b(ok\.|k\.|whatever|sure\.|if you say so|idc|don't care)(?:\b|$)/i;

function msgToMs(date: string, time: string): number | null {
  try {
    const ts = new Date(`${date} ${time}`);
    return Number.isNaN(ts.getTime()) ? null : ts.getTime();
  } catch {
    return null;
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `${hours} hr`;
  return `${Math.round(ms / 86_400_000)} days`;
}

/**
 * Compact stats string computed over ALL imported messages.
 * Sent to the AI so it can answer questions like "who was slow to reply" or
 * "who was dismissive" accurately, even though only recent messages go as transcript.
 * Output is ~300–500 chars — cheap to include in every prompt.
 */
export function buildFullThreadStats(messages: ParsedMessage[]): string {
  if (messages.length === 0) return "";

  const stats = getChatStats(messages);
  const total = stats.totalMessages;
  const lines: string[] = [];

  // Date range + overview
  const firstDate = messages[0].date;
  const lastDate = messages[messages.length - 1].date;
  lines.push(
    `Thread: ${total.toLocaleString()} messages · ${stats.senders.length} participants · ${firstDate}–${lastDate}`
  );

  // Message share per sender (sorted desc)
  const shareStr = [...stats.bySender]
    .sort((a, b) => b.count - a.count)
    .map((s) => `${s.sender.slice(0, 18)} ${Math.round((s.count / total) * 100)}% (${s.count.toLocaleString()})`)
    .join(" · ");
  lines.push(`Messages: ${shareStr}`);

  // Avg reply gap per sender (how long they wait before responding to the other person)
  const gapBySender: Record<string, number[]> = {};
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    if (prev.sender === curr.sender) continue;
    const prevTs = msgToMs(prev.date, prev.time);
    const currTs = msgToMs(curr.date, curr.time);
    if (prevTs === null || currTs === null) continue;
    const gap = currTs - prevTs;
    if (gap < 0 || gap > 86_400_000) continue; // skip negative or > 24 h gaps
    (gapBySender[curr.sender] ??= []).push(gap);
  }
  const gapEntries = Object.entries(gapBySender).filter(([, g]) => g.length >= 2);
  if (gapEntries.length > 0) {
    const gapStr = gapEntries
      .map(([s, gaps]) => {
        const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        return `${s.slice(0, 18)} ${formatDuration(avg)}`;
      })
      .join(" · ");
    lines.push(`Avg reply gap: ${gapStr}`);
  }

  // Sorry / repair language per sender
  const sorryEntries = [...stats.bySender]
    .filter((s) => s.sorryCount > 0)
    .sort((a, b) => b.sorryCount - a.sorryCount);
  if (sorryEntries.length > 0) {
    lines.push(
      `Sorry/repair: ${sorryEntries.map((s) => `${s.sender.slice(0, 18)} ${s.sorryCount}`).join(" · ")}`
    );
  }

  // Dismissive / short replies per sender
  const dismissBySender: Record<string, number> = {};
  for (const m of messages) {
    if (DISMISSIVE.test(m.message)) {
      dismissBySender[m.sender] = (dismissBySender[m.sender] ?? 0) + 1;
    }
  }
  const dismissEntries = Object.entries(dismissBySender).sort((a, b) => b[1] - a[1]);
  if (dismissEntries.length > 0) {
    lines.push(
      `Short/dismissive: ${dismissEntries.map(([s, n]) => `${s.slice(0, 18)} ${n}`).join(" · ")}`
    );
  }

  // Tension & warmth totals
  const conflictHits = messages.filter((m) => CONFLICT_WORDS.test(m.message)).length;
  const affectionHits = messages.filter((m) => AFFECTION_WORDS.test(m.message)).length;
  const markers: string[] = [];
  if (conflictHits > 0) markers.push(`Tension markers: ${conflictHits}`);
  if (affectionHits > 0) markers.push(`Warmth markers: ${affectionHits}`);
  if (markers.length > 0) lines.push(markers.join(" · "));

  return lines.join("\n");
}

export interface ThreadInsight {
  id: string;
  title: string;
  detail: string;
  severity: "neutral" | "note" | "highlight";
}

function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

export function buildThreadInsights(messages: ParsedMessage[], useCase?: UseCaseId): ThreadInsight[] {
  if (messages.length === 0) return [];

  const stats = getChatStats(messages);
  const insights: ThreadInsight[] = [];
  const sorted = [...stats.bySender].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  const second = sorted[1];

  insights.push({
    id: "volume",
    title: "Message volume",
    detail: `${stats.totalMessages.toLocaleString()} messages across ${stats.senders.length} people.`,
    severity: "neutral",
  });

  if (top) {
    const share = pct(top.count, stats.totalMessages);
    insights.push({
      id: "leader",
      title: "Most active",
      detail: `${top.sender} sent ${share}% of messages (${top.count.toLocaleString()}).`,
      severity: share > 65 ? "note" : "neutral",
    });
  }

  if (top && second && stats.senders.length === 2) {
    const ratio = top.count / Math.max(second.count, 1);
    const balance =
      ratio > 2.2
        ? `${top.sender} texts noticeably more than ${second.sender} (${ratio.toFixed(1)}×).`
        : `Fairly balanced between ${top.sender} and ${second.sender}.`;
    insights.push({
      id: "balance",
      title: useCase === "couples" ? "Couple balance" : "Two-way balance",
      detail: balance,
      severity: ratio > 2.2 ? "note" : "highlight",
    });
  }

  const sorryTotal = stats.bySender.reduce((a, s) => a + s.sorryCount, 0);
  if (sorryTotal > 0) {
    const topSorry = [...stats.bySender].sort((a, b) => b.sorryCount - a.sorryCount)[0];
    insights.push({
      id: "repair",
      title: "Repair language",
      detail: topSorry
        ? `${sorryTotal} apology-style messages; ${topSorry.sender} uses them most (${topSorry.sorryCount}).`
        : `${sorryTotal} apology-style messages in the thread.`,
      severity: useCase === "couples" ? "highlight" : "neutral",
    });
  }

  const conflictHits = messages.filter((m) => CONFLICT_WORDS.test(m.message)).length;
  if (conflictHits > 0) {
    insights.push({
      id: "conflict",
      title: "Tension markers",
      detail: `${conflictHits} messages match conflict-style language (angry, hurt, fight, etc.).`,
      severity: conflictHits > stats.totalMessages * 0.05 ? "note" : "neutral",
    });
  }

  const affectionHits = messages.filter((m) => AFFECTION_WORDS.test(m.message)).length;
  if (affectionHits > 0 && useCase === "couples") {
    insights.push({
      id: "warmth",
      title: "Warmth markers",
      detail: `${affectionHits} messages with affection or appreciation language.`,
      severity: "highlight",
    });
  }

  const dismissHits = messages.filter((m) => DISMISSIVE.test(m.message)).length;
  if (dismissHits > 3) {
    insights.push({
      id: "dismiss",
      title: "Short / dismissive replies",
      detail: `${dismissHits} very short or dismissive-style replies detected.`,
      severity: "note",
    });
  }

  const questions = messages.filter((m) => m.message.includes("?")).length;
  if (questions > 0) {
    insights.push({
      id: "questions",
      title: "Questions asked",
      detail: `${pct(questions, stats.totalMessages)}% of messages contain a question — curiosity vs interrogation depends on context.`,
      severity: "neutral",
    });
  }

  if (useCase === "couples") {
    insights.push({
      id: "disclaimer",
      title: "Before you decide anything",
      detail:
        "Stats and AI reads are one lens — not proof of who is right. Use this to prepare a calmer conversation, not to win an argument.",
      severity: "neutral",
    });
  }

  return insights;
}
