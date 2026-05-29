import type { ParsedMessage } from "./parser";
import { getChatStats } from "./parser";
import type { UseCaseId } from "./use-cases";

const CONFLICT_WORDS =
  /\b(angry|mad|upset|fight|argue|hurt|annoyed|frustrated|whatever|fine\.|leave me|done with|toxic|always|never)\b/i;
const AFFECTION_WORDS = /\b(love you|miss you|❤|🥰|sorry|thank you|thanks|appreciate|proud)\b/i;
const DISMISSIVE = /\b(ok\.|k\.|whatever|sure\.|if you say so|idc|don't care)\b/i;

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
