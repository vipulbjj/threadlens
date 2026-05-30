# ThreadLens

Turn chat exports into patterns you can talk about — couples conflict prep, friend-group balance, family threads, and more. Parsing stays in your browser.

**Live:** https://threadlens.vercel.app

## What it does

1. **Export** a chat from WhatsApp, Telegram, or iMessage (`.txt` or `.json`).
2. **Pick a lens** — couples, friends, family, work, reflection, or general.
3. **Parse locally** — the file is not uploaded for analytics.
4. **See insights** — balance, conflict/repair markers, apologies, late-night spikes.
5. **Ask guided questions** with optional AI (xAI preferred; Groq optional fallback). Sign in for 30 free AI questions/day.

## Use cases

Documented in [docs/USE_CASES.md](docs/USE_CASES.md). Launch copy in [docs/MARKETING.md](docs/MARKETING.md).

## Privacy (read this)

- Chat **parsing** happens entirely in your browser.
- **Saved threads** live in `localStorage` on this device (max 12 sessions, last 8k messages each).
- **AI chat** sends only recent messages needed for your question to Groq or xAI when you send a prompt—not your whole export.
- Not therapy, legal, or relationship advice.

## Setup

```bash
npm install
cp .env.example .env
# Prefer free tier: GROQ_API_KEY from https://console.groq.com/
# Fallback: XAI_API_KEY from https://console.x.ai/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run test` — unit tests (Vitest)
- `INTEGRATION_DOWNLOADS=1 npm test` — parse real exports under `~/Downloads/WhatsApp Exports/` (optional, local only)

## Auth & Premium

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). Free tier: 20k message import cap (with warning), 30 AI questions/day, 100 MB uploads. Premium (email-enabled): full import, unlimited AI, very large exports.

## Deploy (Vercel)

1. Set **`XAI_API_KEY`** (primary AI).
2. Set Supabase vars for sign-in + usage tracking (see SUPABASE_SETUP.md).
3. Optional: **`GROQ_API_KEY`**, **`PREMIUM_EMAILS`**, **`PREMIUM_CONTACT_EMAIL`**.

Health check: `GET /api/health` reports AI provider and whether auth is configured.

## Tech

Next.js 16 · React 19 · Zustand · Tailwind CSS 4 · OpenAI SDK (Groq + xAI compatible APIs)

## Contact

Built by [Vipul Bajaj](https://vipulbajaj.com) — feedback welcome via site or LinkedIn (linked in app footer).
