# ThreadLens

Understand what your group chats are really saying — without sending your whole camera roll to the cloud.

## What it does

1. **Export** a chat from WhatsApp, Telegram, or iMessage (`.txt` or `.json`).
2. **Parse locally** in your browser — the file is not uploaded to our servers for parsing.
3. **See stats** on the dashboard: who texts most, message counts, apology-style replies.
4. **Ask questions** with optional AI (xAI Grok). Only the messages needed to answer your question are sent to the API.

## Privacy (read this)

- Chat **parsing** happens entirely in your browser.
- **Saved threads** live in your browser’s `localStorage` on this device only.
- **AI chat** sends message text from the thread you are asking about to [xAI](https://x.ai/) when you click send. We do not run a “zero-knowledge” backend that never sees your messages unless you use AI features.

## Setup

```bash
npm install
cp .env.example .env   # add XAI_API_KEY from https://console.x.ai/
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run test` — parser unit tests (Vitest)

## Deploy

Configured for [Vercel](https://vercel.app). Set `XAI_API_KEY` in the Vercel project environment.

## Tech

Next.js 16 · React 19 · Zustand · Tailwind CSS 4 · Recharts · OpenAI SDK (xAI API)
