/**
 * Build LinkedIn screenshot HTML — marketing mock (Rahul / Simran, dramatized stats).
 * Run: npx tsx scripts/build-linkedin-preview.ts
 * PNGs: auto-captured after HTML build (element crop + Instagram 4:5).
 */
import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ThreadInsight } from "../src/lib/insights";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MALE = "Rahul";
const FEMALE = "Simran";
const MOCK_MESSAGE_COUNT = 52_400;

/** Dramatized copy for LinkedIn — illustrative, not computed from export. */
function mockInsightCards(): ThreadInsight[] {
  return [
    {
      id: "replyspeed",
      title: "Reply speed",
      detail: `Wild gap — ${MALE} replies in ~12 min; ${FEMALE} averages 5 hr 20 min.`,
      severity: "note",
    },
    {
      id: "initiation",
      title: "Who initiates",
      detail: `${FEMALE} opens 76% of chats. ${MALE} only 24%.`,
      severity: "note",
    },
    {
      id: "balance",
      title: "Couple balance",
      detail: `${MALE} sent 35,600 texts. ${FEMALE} sent 16,800. Not even close.`,
      severity: "note",
    },
    {
      id: "conflict",
      title: "Tension markers",
      detail: `892 fights-in-text — angry, hurt, “we need to talk,” frustrated, done.`,
      severity: "note",
    },
    {
      id: "repair",
      title: "Repair language",
      detail: `518 sorry / my bad / didn’t mean it — ${MALE} apologizes 341× vs ${FEMALE} 94×.`,
      severity: "note",
    },
    {
      id: "questions",
      title: "Questions asked",
      detail: `${FEMALE} asks 79% of all questions (5,760 with “?”). ${MALE} asks 21%.`,
      severity: "note",
    },
    {
      id: "dismissive",
      title: "Short / dismissive replies",
      detail: `${FEMALE} sent 412 one-word replies (k, ok, hmm, ya). ${MALE} sent 89.`,
      severity: "note",
    },
    {
      id: "afterhours",
      title: "After-hours messages",
      detail: `${MALE} sends 71% of texts between 10pm–2am. ${FEMALE} peaks at lunch.`,
      severity: "note",
    },
    {
      id: "latenight",
      title: "Late-night messages",
      detail: `1,240 messages sent midnight–4am — mostly ${MALE} venting, ${FEMALE} slow to answer.`,
      severity: "note",
    },
    {
      id: "ghosting",
      title: "Silence / ghosting",
      detail: `27 times ${FEMALE} left ${MALE} on read 48+ hours after a long message.`,
      severity: "note",
    },
  ];
}

const MOCK_HEADLINE =
  "52,400 messages. The argument you replay in your head is a sliver of the data.";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function severityClass(severity: ThreadInsight["severity"]) {
  if (severity === "note") return "card card-note";
  if (severity === "highlight") return "card card-highlight";
  return "card";
}

function renderHtml(opts: {
  title: string;
  subtitle: string;
  headline: string;
  cards: ThreadInsight[];
}) {
  const cardHtml = opts.cards
    .map(
      (c) => `
    <div class="${severityClass(c.severity)}">
      <span class="dot" aria-hidden="true"></span>
      <div>
        <p class="card-title">${esc(c.title)}</p>
        <p class="card-detail">${esc(c.detail)}</p>
      </div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ThreadLens LinkedIn preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; }
    html, body {
      font-family: "DM Sans", system-ui, sans-serif;
      background: #f0f0f2;
      color: #18181b;
      margin: 0;
      padding: 0;
      min-height: 0;
    }
    .instagram-canvas {
      width: 1080px;
      height: 1350px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px 22px;
      box-sizing: border-box;
      background: #e8e8ec;
    }
    .frame {
      width: 100%;
      max-width: 1016px;
      border: 1px solid #d4d4d8;
      border-radius: 16px;
      background: #fff;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(0,0,0,0.08);
    }
    .instagram-canvas .header h1 { font-size: 17px; }
    .instagram-canvas .header p { font-size: 13px; }
    .instagram-canvas .overview { font-size: 14px; }
    .instagram-canvas .card-title { font-size: 14px; }
    .instagram-canvas .card-detail { font-size: 13px; }
    .instagram-canvas .brand { font-size: 13px; padding: 12px 18px; }
    .header {
      padding: 14px 18px;
      border-bottom: 1px solid #e4e4e7;
    }
    .header h1 { font-size: 15px; font-weight: 600; }
    .header p { font-size: 12px; color: #71717a; margin-top: 4px; }
    .body { padding: 14px 18px 18px; }
    .overview {
      font-size: 13px;
      color: #52525b;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .overview span.label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #a1a1aa;
      margin-right: 6px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .card {
      display: flex;
      gap: 8px;
      padding: 10px 11px;
      border-radius: 12px;
      border: 1px solid #e4e4e7;
      background: #fff;
    }
    .card-note {
      border-color: rgba(180, 120, 30, 0.4);
      background: #fef9e8;
    }
    .card-highlight {
      border-color: rgba(16, 185, 129, 0.35);
      background: #ecfdf5;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
      background: #a1a1aa;
    }
    .card-note .dot { background: #b45309; }
    .card-highlight .dot { background: #059669; }
    .card-title { font-size: 13px; font-weight: 600; line-height: 1.3; color: #18181b; }
    .card-detail { font-size: 12px; color: #3f3f46; margin-top: 3px; line-height: 1.4; }
    .overview strong { color: #18181b; font-weight: 600; }
    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 18px;
      background: #fafafa;
      border-top: 1px solid #e4e4e7;
      font-size: 12px;
      font-weight: 600;
      color: #047857;
    }
  </style>
</head>
<body>
  <div class="instagram-canvas" id="instagram-canvas">
    <div class="frame" id="capture">
      <div class="header">
        <h1>${esc(opts.title)}</h1>
        <p>${esc(opts.subtitle)}</p>
      </div>
      <div class="body">
        ${opts.headline ? `<p class="overview"><span class="label">Overview</span>${esc(opts.headline)}</p>` : ""}
        <div class="grid">${cardHtml}</div>
      </div>
      <div class="brand">ThreadLens</div>
    </div>
  </div>
</body>
</html>`;
}

function main() {
  const cards = mockInsightCards();
  const countLabel = MOCK_MESSAGE_COUNT.toLocaleString();

  const html = renderHtml({
    title: "Thread insights",
    subtitle: `${countLabel} messages · Couples lens · 2 people`,
    headline: MOCK_HEADLINE,
    cards,
  });

  const outDir = join(root, "public/marketing");
  mkdirSync(outDir, { recursive: true });
  const htmlPath = join(outDir, "linkedin-chat2-preview.html");
  writeFileSync(htmlPath, html);

  execSync(`npx tsx scripts/capture-marketing-png.ts "${htmlPath}" "${outDir}"`, {
    stdio: "inherit",
  });

  const linkedinPng = join(outDir, "linkedin-chat2.png");
  const instaPng = join(outDir, "instagram-chat2.png");

  console.log(
    JSON.stringify(
      {
        htmlPath,
        linkedinPng,
        instagramPng: instaPng,
        instagramSize: "1080×1350 (4:5 feed)",
        messageCount: MOCK_MESSAGE_COUNT,
        names: { male: MALE, female: FEMALE },
        mock: true,
        cards: cards.map((c) => ({ title: c.title, detail: c.detail, severity: c.severity })),
      },
      null,
      2
    )
  );
}

main();
