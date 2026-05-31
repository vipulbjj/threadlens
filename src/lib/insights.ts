import type { ParsedMessage } from "./parser";
import { getChatStats } from "./parser";
import type { UseCaseId } from "./use-cases";

// ─── Sentiment / language patterns ────────────────────────────────────────────

const CONFLICT_WORDS =
  /\b(angry|mad|upset|fight|argue|hurt|annoyed|frustrated|whatever|fine\.|leave me|done with|toxic|always|never)\b/i;
const AFFECTION_WORDS = /\b(love you|miss you|❤|🥰|sorry|thank you|thanks|appreciate|proud)\b/i;
const DISMISSIVE = /\b(ok\.|k\.|whatever|sure\.|if you say so|idc|don't care)(?:\b|$)/i;
const PLAN_WORDS = /\b(let'?s|wanna|wanna hang|meet up|dinner|lunch|coffee|drinks|friday|saturday|sunday|tonight|tomorrow|this week)\b/i;
const CHECKIN_WORDS = /\b(how are you|how's it going|hope you'?re|thinking of you|checking in|how have you been|you okay|everything ok)\b/i;
const ENCOURAGE_WORDS = /\b(proud of you|well done|good job|you got this|believe in you|amazing|so proud|you're doing great)\b/i;
const URGENCY_WORDS = /\b(asap|urgent|immediately|right now|as soon as|please respond|need this now|can you please|need you to)\b/i;
const ENTHUSIASM_WORDS = /(!{2,}|hahaha|lmao|omg|😂|🤣|❤️|😍|🙌|💯|yess|omgg|sooo)/i;
const INITIATION_GAP_MS = 4 * 60 * 60 * 1000; // 4 hours = new conversation

// ─── Timestamp helpers ─────────────────────────────────────────────────────────

function msgToMs(date: string, time: string): number | null {
  try {
    const ts = new Date(`${date} ${time}`);
    return Number.isNaN(ts.getTime()) ? null : ts.getTime();
  } catch {
    return null;
  }
}

function getHour(time: string): number | null {
  const match = time.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/);
  if (!match) return null;
  let hour = Number.parseInt(match[1], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour;
}

function isAfterHours(time: string, startHour = 9, endHour = 18): boolean {
  const h = getHour(time);
  if (h === null) return false;
  return h < startHour || h >= endHour;
}

function isLateNight(time: string): boolean {
  const h = getHour(time);
  if (h === null) return false;
  return h >= 22 || h < 6;
}

function isWeekend(date: string, time: string): boolean {
  const ts = msgToMs(date, time);
  if (ts === null) return false;
  const day = new Date(ts).getDay();
  return day === 0 || day === 6;
}

/** For each sender, count messages sent first after a silence gap (= conversation initiations). */
function getInitiations(messages: ParsedMessage[], minGapMs = INITIATION_GAP_MS): Record<string, number> {
  const counts: Record<string, number> = {};
  if (messages.length === 0) return counts;
  // First message always counts as an initiation
  counts[messages[0].sender] = 1;
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    const prevTs = msgToMs(prev.date, prev.time);
    const currTs = msgToMs(curr.date, curr.time);
    if (prevTs === null || currTs === null) continue;
    if (currTs - prevTs >= minGapMs) {
      counts[curr.sender] = (counts[curr.sender] ?? 0) + 1;
    }
  }
  return counts;
}

/** Count messages per sender matching a test. */
function countPerSender(
  messages: ParsedMessage[],
  test: (m: ParsedMessage) => boolean
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const m of messages) {
    if (test(m)) counts[m.sender] = (counts[m.sender] ?? 0) + 1;
  }
  return counts;
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `${hours} hr`;
  return `${Math.round(ms / 86_400_000)} days`;
}

function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

function top2(record: Record<string, number>): [string, number][] {
  return Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, 2);
}

// ─── Stats block for AI context ───────────────────────────────────────────────

/**
 * Compact stats string over ALL messages — sent to the AI so it can answer
 * pattern questions (reply speed, who initiates, after-hours, etc.) accurately
 * even though the transcript excerpt is only the last ~350-800 messages.
 * Output is ≤700 chars — adds ~150-175 tokens per request.
 */
export function buildFullThreadStats(messages: ParsedMessage[], useCase?: UseCaseId): string {
  if (messages.length === 0) return "";

  const stats = getChatStats(messages);
  const total = stats.totalMessages;
  const lines: string[] = [];

  // Overview
  lines.push(
    `Thread: ${total.toLocaleString()} messages · ${(stats.isOneToOne ? 2 : stats.senders.length)} participants · ${messages[0].date}–${messages[messages.length - 1].date}`
  );

  // Message share
  const shareStr = [...stats.bySender]
    .sort((a, b) => b.count - a.count)
    .map((s) => `${s.sender.slice(0, 18)} ${pct(s.count, total)}% (${s.count.toLocaleString()})`)
    .join(" · ");
  lines.push(`Messages: ${shareStr}`);

  // Reply gaps
  const gapBySender: Record<string, number[]> = {};
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    if (prev.sender === curr.sender) continue;
    const gap = (msgToMs(curr.date, curr.time) ?? 0) - (msgToMs(prev.date, prev.time) ?? 0);
    if (gap > 0 && gap <= 86_400_000) (gapBySender[curr.sender] ??= []).push(gap);
  }
  const gapEntries = Object.entries(gapBySender).filter(([, g]) => g.length >= 2);
  if (gapEntries.length > 0) {
    lines.push(
      `Avg reply gap: ${gapEntries
        .map(([s, g]) => `${s.slice(0, 18)} ${formatDuration(g.reduce((a, b) => a + b, 0) / g.length)}`)
        .join(" · ")}`
    );
  }

  // Initiation counts
  const initiations = getInitiations(messages);
  if (Object.keys(initiations).length > 0) {
    lines.push(
      `Conversation starts: ${top2(initiations)
        .map(([s, n]) => `${s.slice(0, 18)} ${n}`)
        .join(" · ")}`
    );
  }

  // Sorry / repair
  const sorryEntries = [...stats.bySender]
    .filter((s) => s.sorryCount > 0)
    .sort((a, b) => b.sorryCount - a.sorryCount);
  if (sorryEntries.length > 0) {
    lines.push(`Sorry/repair: ${sorryEntries.map((s) => `${s.sender.slice(0, 18)} ${s.sorryCount}`).join(" · ")}`);
  }

  // Dismissive
  const dismissBySender = countPerSender(messages, (m) => DISMISSIVE.test(m.message));
  const dismissEntries = Object.entries(dismissBySender).sort((a, b) => b[1] - a[1]);
  if (dismissEntries.length > 0) {
    lines.push(`Short/dismissive: ${dismissEntries.map(([s, n]) => `${s.slice(0, 18)} ${n}`).join(" · ")}`);
  }

  // Use-case-specific extras
  if (useCase === "work") {
    const afterHours = messages.filter((m) => isAfterHours(m.time)).length;
    const weekends = messages.filter((m) => isWeekend(m.date, m.time)).length;
    const urgent = messages.filter((m) => URGENCY_WORDS.test(m.message)).length;
    lines.push(`After-hours: ${afterHours} msgs · Weekends: ${weekends} · Urgency language: ${urgent}`);
  }

  if (useCase === "reflection") {
    const enthusiasm = messages.filter((m) => ENTHUSIASM_WORDS.test(m.message)).length;
    lines.push(`Enthusiasm markers: ${enthusiasm}`);
  }

  if (useCase === "family") {
    const checkIns = messages.filter((m) => CHECKIN_WORDS.test(m.message)).length;
    const encouragement = messages.filter((m) => ENCOURAGE_WORDS.test(m.message)).length;
    lines.push(`Check-in messages: ${checkIns} · Encouragement: ${encouragement}`);
  }

  if (useCase === "friends") {
    const plans = messages.filter((m) => PLAN_WORDS.test(m.message)).length;
    lines.push(`Plan signals: ${plans}`);
  }

  // Tension & warmth
  const conflictHits = messages.filter((m) => CONFLICT_WORDS.test(m.message)).length;
  const affectionHits = messages.filter((m) => AFFECTION_WORDS.test(m.message)).length;
  const markers: string[] = [];
  if (conflictHits > 0) markers.push(`Tension: ${conflictHits}`);
  if (affectionHits > 0) markers.push(`Warmth: ${affectionHits}`);
  if (markers.length > 0) lines.push(markers.join(" · "));

  return lines.join("\n").slice(0, 700);
}

// ─── Insight panel ─────────────────────────────────────────────────────────────

export interface ThreadInsight {
  id: string;
  title: string;
  detail: string;
  severity: "neutral" | "note" | "highlight";
}

export function buildThreadInsights(messages: ParsedMessage[], useCase?: UseCaseId): ThreadInsight[] {
  if (messages.length === 0) return [];

  const stats = getChatStats(messages);
  const insights: ThreadInsight[] = [];
  const total = stats.totalMessages;
  const sorted = [...stats.bySender].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  const second = sorted[1];
  const isTwoPerson = stats.isOneToOne ?? stats.senders.length === 2;

  // ── Always shown ──────────────────────────────────────────────────────────

  insights.push({
    id: "volume",
    title: "Message volume",
    detail: `${total.toLocaleString()} messages across ${stats.isOneToOne ? 2 : stats.senders.length} ${stats.isOneToOne || stats.senders.length !== 1 ? "people" : "person"}.`,
    severity: "neutral",
  });

  if (top) {
    const share = pct(top.count, total);
    insights.push({
      id: "leader",
      title: "Most active",
      detail: `${top.sender} sent ${share}% of messages (${top.count.toLocaleString()}).`,
      severity: share > 65 ? "note" : "neutral",
    });
  }

  // Two-person balance
  if (top && second && isTwoPerson) {
    const ratio = top.count / Math.max(second.count, 1);
    const label =
      useCase === "couples" ? "Couple balance" : useCase === "reflection" ? "Interest balance" : "Two-way balance";
    insights.push({
      id: "balance",
      title: label,
      detail:
        ratio > 2.2
          ? `${top.sender} texts noticeably more (${ratio.toFixed(1)}×). Could signal effort imbalance.`
          : `Fairly balanced — ${top.sender} ${pct(top.count, total)}%, ${second.sender} ${pct(second.count, total)}%.`,
      severity: ratio > 2.2 ? "note" : "highlight",
    });
  }

  // ── Reply speed (whenever timestamps parse) ───────────────────────────────

  const gapBySender: Record<string, number[]> = {};
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    if (prev.sender === curr.sender) continue;
    const gap = (msgToMs(curr.date, curr.time) ?? 0) - (msgToMs(prev.date, prev.time) ?? 0);
    if (gap > 0 && gap <= 86_400_000) (gapBySender[curr.sender] ??= []).push(gap);
  }
  const gapEntries = Object.entries(gapBySender).filter(([, g]) => g.length >= 2);
  if (gapEntries.length >= 2) {
    const sorted2 = gapEntries
      .map(([s, g]) => ({ sender: s, avg: g.reduce((a, b) => a + b, 0) / g.length }))
      .sort((a, b) => a.avg - b.avg);
    const faster = sorted2[0];
    const slower = sorted2[sorted2.length - 1];
    const diff = slower.avg / Math.max(faster.avg, 1);
    insights.push({
      id: "replyspeed",
      title: "Reply speed",
      detail:
        diff > 2
          ? `${faster.sender} replies ~${formatDuration(faster.avg)} on avg; ${slower.sender} takes ~${formatDuration(slower.avg)} — ${diff.toFixed(1)}× slower.`
          : `Similar reply speeds — ${sorted2.map((e) => `${e.sender} ~${formatDuration(e.avg)}`).join(", ")}.`,
      severity: diff > 3 ? "note" : "neutral",
    });
  } else if (gapEntries.length === 1) {
    const [sender, gaps] = gapEntries[0];
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    insights.push({
      id: "replyspeed",
      title: "Reply speed",
      detail: `${sender} avg reply time: ~${formatDuration(avg)}.`,
      severity: "neutral",
    });
  }

  // ── Initiation (who starts conversations after silence) ───────────────────

  const initiations = getInitiations(messages);
  const initEntries = Object.entries(initiations).sort((a, b) => b[1] - a[1]);
  const totalInits = initEntries.reduce((s, [, n]) => s + n, 0);
  if (initEntries.length >= 2 && totalInits >= 5) {
    const [topInit, topInitCount] = initEntries[0];
    const topInitPct = pct(topInitCount, totalInits);
    const label =
      useCase === "reflection" ? "Who reaches out first" : useCase === "couples" ? "Who initiates" : "Conversation starter";
    insights.push({
      id: "initiation",
      title: label,
      detail:
        topInitPct > 65
          ? `${topInit} starts ${topInitPct}% of conversations (after 4+ hour gaps). Noticeable imbalance.`
          : `Fairly mutual — ${initEntries.filter(([, n]) => pct(n, totalInits) > 0).map(([s, n]) => `${s} ${pct(n, totalInits)}%`).join(", ")}.`,
      severity: topInitPct > 65 ? "note" : "highlight",
    });
  }

  // ── Repair language ───────────────────────────────────────────────────────

  const sorryTotal = stats.bySender.reduce((a, s) => a + s.sorryCount, 0);
  if (sorryTotal > 0) {
    const topSorry = [...stats.bySender].sort((a, b) => b.sorryCount - a.sorryCount)[0];
    insights.push({
      id: "repair",
      title: "Repair language",
      detail: topSorry
        ? `${sorryTotal} apology-style messages; ${topSorry.sender} says sorry most (${topSorry.sorryCount}×).`
        : `${sorryTotal} apology-style messages in the thread.`,
      severity: useCase === "couples" || useCase === "family" ? "highlight" : "neutral",
    });
  }

  // ── Conflict / tension ────────────────────────────────────────────────────

  const conflictHits = messages.filter((m) => CONFLICT_WORDS.test(m.message)).length;
  if (conflictHits > 0) {
    insights.push({
      id: "conflict",
      title: "Tension markers",
      detail: `${conflictHits} messages with conflict-style language (angry, hurt, fight, frustrated, etc.).`,
      severity: conflictHits > total * 0.05 ? "note" : "neutral",
    });
  }

  // ── Questions asked ───────────────────────────────────────────────────────

  const questions = messages.filter((m) => m.message.includes("?")).length;
  if (questions > 0) {
    const questionsBySender = countPerSender(messages, (m) => m.message.includes("?"));
    const qEntries = Object.entries(questionsBySender).sort((a, b) => b[1] - a[1]);
    const detail =
      isTwoPerson && qEntries.length === 2
        ? `${qEntries[0][0]} asks ${pct(qEntries[0][1], questions)}% of questions — ${pct(questions, total)}% of all messages contain one.`
        : `${pct(questions, total)}% of messages contain a question.`;
    insights.push({
      id: "questions",
      title: "Questions asked",
      detail,
      severity: "neutral",
    });
  }

  // ── Dismissive replies ────────────────────────────────────────────────────

  const dismissBySender = countPerSender(messages, (m) => DISMISSIVE.test(m.message));
  const dismissTotal = Object.values(dismissBySender).reduce((a, b) => a + b, 0);
  if (dismissTotal > 3) {
    const topDismiss = Object.entries(dismissBySender).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: "dismiss",
      title: "Short / dismissive replies",
      detail: topDismiss
        ? `${dismissTotal} dismissive-style replies; ${topDismiss[0]} accounts for ${topDismiss[1]}.`
        : `${dismissTotal} very short or dismissive-style replies detected.`,
      severity: "note",
    });
  }

  // ── Use-case-specific insights ────────────────────────────────────────────

  if (useCase === "couples" || useCase === "family") {
    const affectionHits = messages.filter((m) => AFFECTION_WORDS.test(m.message)).length;
    if (affectionHits > 0) {
      const affBySender = countPerSender(messages, (m) => AFFECTION_WORDS.test(m.message));
      const topAff = Object.entries(affBySender).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        id: "warmth",
        title: "Warmth markers",
        detail: topAff
          ? `${affectionHits} affection/appreciation messages; ${topAff[0]} expresses it most (${topAff[1]}×).`
          : `${affectionHits} messages with affection or appreciation language.`,
        severity: "highlight",
      });
    }
  }

  if (useCase === "couples") {
    // Late night messages (signal emotional intensity or avoidance)
    const lateNightCount = messages.filter((m) => isLateNight(m.time)).length;
    if (lateNightCount > 0) {
      const lateNightBySender = countPerSender(messages, (m) => isLateNight(m.time));
      const topLate = Object.entries(lateNightBySender).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        id: "latenight",
        title: "Late-night messages",
        detail: topLate
          ? `${lateNightCount} messages sent after 10 pm or before 6 am; ${topLate[0]} sends most (${topLate[1]}). Late-night texts often carry higher emotional charge.`
          : `${lateNightCount} messages sent after 10 pm / before 6 am.`,
        severity: lateNightCount > total * 0.1 ? "note" : "neutral",
      });
    }

    insights.push({
      id: "disclaimer",
      title: "Before you decide anything",
      detail:
        "Stats and AI reads are one lens — not proof of who is right. Use this to start a calmer conversation, not to win an argument.",
      severity: "neutral",
    });
  }

  if (useCase === "friends") {
    // Plan-making signals
    const planMsgs = messages.filter((m) => PLAN_WORDS.test(m.message)).length;
    if (planMsgs > 0) {
      const planBySender = countPerSender(messages, (m) => PLAN_WORDS.test(m.message));
      const topPlan = Object.entries(planBySender).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        id: "plans",
        title: "Plan-making",
        detail: topPlan
          ? `${planMsgs} messages about plans or meetups; ${topPlan[0]} drives it most (${topPlan[1]}×).`
          : `${planMsgs} messages reference plans, meetups, or hangouts.`,
        severity: planMsgs > 0 ? "highlight" : "neutral",
      });
    } else {
      insights.push({
        id: "plans",
        title: "Plan-making",
        detail: "No concrete plan language detected (let's hang, meet up, dinner, etc.). Chat may stay in theory.",
        severity: "note",
      });
    }

    // Ghost detector — find who has the most long-silence periods (>7 days with no messages)
    const silenceBySender: Record<string, number> = {};
    for (let i = 1; i < messages.length; i++) {
      const prev = messages[i - 1];
      const curr = messages[i];
      if (prev.sender === curr.sender) continue;
      const gap = (msgToMs(curr.date, curr.time) ?? 0) - (msgToMs(prev.date, prev.time) ?? 0);
      if (gap >= 7 * 86_400_000) {
        // The person who was silent is the prev sender (they sent something, then went quiet)
        silenceBySender[prev.sender] = (silenceBySender[prev.sender] ?? 0) + 1;
      }
    }
    const silenceEntries = Object.entries(silenceBySender).sort((a, b) => b[1] - a[1]);
    if (silenceEntries.length > 0) {
      const [silentOne, silentCount] = silenceEntries[0];
      insights.push({
        id: "ghost",
        title: "Silence / ghosting",
        detail:
          silentCount > 3
            ? `${silentOne} goes quiet for 7+ days most often (${silentCount}× detected). Check if engagement dropped over time.`
            : `${silentCount} silence period${silentCount > 1 ? "s" : ""} of 7+ days detected (${silentOne}).`,
        severity: silentCount > 3 ? "note" : "neutral",
      });
    }
  }

  if (useCase === "family") {
    // Check-in language
    const checkInMsgs = messages.filter((m) => CHECKIN_WORDS.test(m.message)).length;
    if (checkInMsgs > 0) {
      const checkInBySender = countPerSender(messages, (m) => CHECKIN_WORDS.test(m.message));
      const topCheck = Object.entries(checkInBySender).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        id: "checkin",
        title: "Check-in messages",
        detail: topCheck
          ? `${checkInMsgs} caring check-in messages; ${topCheck[0]} reaches out most (${topCheck[1]}×).`
          : `${checkInMsgs} messages with caring check-in language.`,
        severity: "highlight",
      });
    }

    // Encouragement
    const encourageMsgs = messages.filter((m) => ENCOURAGE_WORDS.test(m.message)).length;
    if (encourageMsgs > 0) {
      insights.push({
        id: "encourage",
        title: "Encouragement",
        detail: `${encourageMsgs} messages with praise or encouragement ("proud of you", "well done", etc.).`,
        severity: "highlight",
      });
    }

    // After-hours family messages (worry signals)
    const lateNightCount = messages.filter((m) => isLateNight(m.time)).length;
    if (lateNightCount > 0) {
      insights.push({
        id: "latenight",
        title: "Late-night messages",
        detail: `${lateNightCount} messages after 10 pm or before 6 am — may signal worry, emergencies, or just night-owl habits.`,
        severity: lateNightCount > total * 0.1 ? "note" : "neutral",
      });
    }
  }

  if (useCase === "work") {
    // After-hours messages
    const afterHoursMsgs = messages.filter((m) => isAfterHours(m.time)).length;
    const afterHoursBySender = countPerSender(messages, (m) => isAfterHours(m.time));
    const topAfterHours = Object.entries(afterHoursBySender).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      id: "afterhours",
      title: "After-hours messages",
      detail:
        afterHoursMsgs > 0
          ? topAfterHours
            ? `${afterHoursMsgs} messages outside 9 am–6 pm (${pct(afterHoursMsgs, total)}%); ${topAfterHours[0]} sends most (${topAfterHours[1]}).`
            : `${afterHoursMsgs} messages outside 9 am–6 pm (${pct(afterHoursMsgs, total)}% of thread).`
          : "No after-hours messages detected.",
      severity: afterHoursMsgs > total * 0.3 ? "note" : "neutral",
    });

    // Weekend messages
    const weekendMsgs = messages.filter((m) => isWeekend(m.date, m.time)).length;
    if (weekendMsgs > 0) {
      insights.push({
        id: "weekend",
        title: "Weekend messages",
        detail: `${weekendMsgs} messages on weekends (${pct(weekendMsgs, total)}%). ${weekendMsgs > total * 0.2 ? "Work is bleeding into personal time." : "Occasional weekend contact."}`,
        severity: weekendMsgs > total * 0.2 ? "note" : "neutral",
      });
    }

    // Urgency language
    const urgencyMsgs = messages.filter((m) => URGENCY_WORDS.test(m.message)).length;
    if (urgencyMsgs > 0) {
      const urgencyBySender = countPerSender(messages, (m) => URGENCY_WORDS.test(m.message));
      const topUrgency = Object.entries(urgencyBySender).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        id: "urgency",
        title: "Urgency language",
        detail: topUrgency
          ? `${urgencyMsgs} messages with urgent phrasing (ASAP, "right now", etc.); ${topUrgency[0]} uses it most.`
          : `${urgencyMsgs} messages with urgent phrasing.`,
        severity: urgencyMsgs > total * 0.1 ? "note" : "neutral",
      });
    }

    // Message length asymmetry (who writes essays vs one-liners)
    if (stats.bySender.length >= 2) {
      const byLength = [...stats.bySender].sort((a, b) => b.avgLength - a.avgLength);
      const longest = byLength[0];
      const shortest = byLength[byLength.length - 1];
      if (longest.avgLength > 0 && shortest.avgLength > 0) {
        const ratio = longest.avgLength / Math.max(shortest.avgLength, 1);
        if (ratio >= 2) {
          insights.push({
            id: "msglength",
            title: "Message length gap",
            detail: `${longest.sender} writes ${ratio.toFixed(1)}× longer messages on avg (${longest.avgLength} chars vs ${shortest.avgLength}). May signal one-way information dumping.`,
            severity: ratio >= 3 ? "note" : "neutral",
          });
        }
      }
    }
  }

  if (useCase === "reflection") {
    // Enthusiasm / interest signals
    const enthusiasmMsgs = messages.filter((m) => ENTHUSIASM_WORDS.test(m.message)).length;
    if (enthusiasmMsgs > 0) {
      const enthBySender = countPerSender(messages, (m) => ENTHUSIASM_WORDS.test(m.message));
      const sorted3 = Object.entries(enthBySender).sort((a, b) => b[1] - a[1]);
      insights.push({
        id: "enthusiasm",
        title: "Enthusiasm signals",
        detail:
          sorted3.length >= 2
            ? `${sorted3[0][0]} shows more excitement (${sorted3[0][1]}× vs ${sorted3[1][1]}× for ${sorted3[1][0]}). "!!", "hahaha", emojis counted.`
            : `${enthusiasmMsgs} enthusiastic messages (emojis, "!!", "lol", etc.).`,
        severity: (() => {
          if (sorted3.length < 2) return "neutral";
          const ratio = sorted3[0][1] / Math.max(sorted3[1][1], 1);
          return ratio > 2 ? "note" : "highlight";
        })(),
      });
    }

    // Affection markers as interest signal
    const affectionHits = messages.filter((m) => AFFECTION_WORDS.test(m.message)).length;
    if (affectionHits > 0) {
      const affBySender = countPerSender(messages, (m) => AFFECTION_WORDS.test(m.message));
      const sorted4 = Object.entries(affBySender).sort((a, b) => b[1] - a[1]);
      insights.push({
        id: "warmth",
        title: "Affection / appreciation",
        detail:
          sorted4.length >= 2
            ? `${affectionHits} warm messages; ${sorted4[0][0]} leads (${sorted4[0][1]}× vs ${sorted4[1][1]}×).`
            : `${affectionHits} messages with affection or appreciation language.`,
        severity: "highlight",
      });
    }

    insights.push({
      id: "disclaimer",
      title: "Remember",
      detail: "Stats show patterns, not intent. Context matters — a slow reply might be a busy day, not disinterest.",
      severity: "neutral",
    });
  }

  if (useCase === "general") {
    // Message length per sender
    if (stats.bySender.length >= 2) {
      const byLength = [...stats.bySender].sort((a, b) => b.avgLength - a.avgLength);
      const longest = byLength[0];
      insights.push({
        id: "msglength",
        title: "Message depth",
        detail: `${longest.sender} writes the most per message (~${longest.avgLength} chars avg). ${byLength[byLength.length - 1].avgLength < longest.avgLength / 2 ? "Notable depth gap with others." : "Others are in a similar range."}`,
        severity: "neutral",
      });
    }
  }

  return insights;
}
