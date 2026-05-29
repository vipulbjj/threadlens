# ThreadLens use cases

ThreadLens analyzes exported chat logs **on your device** and optionally answers guided questions with AI. It is for reflection and conversation prep—not therapy, legal advice, or surveillance.

## 1. Couples — conflict resolution & repair

**Who:** Partners in a romantic relationship who want to understand recurring fights before talking in person.

**What ThreadLens shows:**
- Message balance (who texts more, who apologizes)
- Conflict-adjacent language spikes
- Repair signals (sorry, appreciation, affection)
- Late-night message clusters (often when tensions run high)

**Guided prompts (examples):**
- What topics keep triggering arguments?
- Where do we repair well vs. stay stuck?
- Summarize the tone shift over the last month.

**How to use it well:**
1. Export the 1:1 WhatsApp thread (without media).
2. Choose **Couples** on upload.
3. Read insights together or separately, then use one prompt each—not as a scorecard to win.

**Limits:** Cannot read tone of voice, sarcasm, or context outside the chat. Not a substitute for couples therapy.

---

## 2. Close friends — group chat dynamics

**Who:** Friend groups wondering who carries the chat, who goes quiet, or why a thread feels one-sided.

**What ThreadLens shows:**
- Who messages most
- Group size and participation spread
- Light conflict / dismissive patterns in text

**Good for:** “Is it just me feeling left out?” before bringing it up casually.

---

## 3. Family — parent / sibling / household threads

**Who:** Adult siblings, parents and teens (with consent), or family logistics groups.

**What ThreadLens shows:**
- Who initiates vs. responds
- Stress language during busy seasons
- Apology / thanks patterns

**Important:** Only analyze threads you are part of and have permission to export.

---

## 4. Work — professional boundaries

**Who:** People reviewing Slack-style exports or professional WhatsApp groups (where policy allows).

**What ThreadLens shows:**
- After-hours message timing
- Who drives volume in a thread
- Tone markers (not HR-grade sentiment scoring)

**Not for:** Covert monitoring of colleagues without consent.

---

## 5. Situationship / dating

**Who:** People trying to read mutual interest or initiation patterns in early dating threads.

**What ThreadLens shows:**
- Message balance and who texts first after gaps
- Tone cues (not mind-reading — text only)

---

## 6. Just exploring — any thread

Default lens when none of the above fits. Same stats and AI with neutral framing.

---

## Privacy model (all use cases)

| Step | Where data goes |
|------|-----------------|
| Parse export | Browser only |
| Store session | `localStorage` on your device (max 12 sessions, last 8k msgs each) |
| Optional AI | Recent messages + your question → Groq (preferred) or xAI |

Delete a session anytime from the dashboard. Clear site data to wipe all sessions.

---

## Contact

Built by [Vipul Bajaj](https://vipulbajaj.com) — feedback and collabs welcome via the site or LinkedIn linked in the app footer.
