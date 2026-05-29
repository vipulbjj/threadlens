@AGENTS.md

# threadlens — CLAUDE.md

## What this is

Privacy-first group chat analytics: upload a WhatsApp, Telegram, or iMessage export and see who dominates the thread, message patterns, and apology-style replies — parsed entirely in your browser. Optional AI Q&A via xAI Grok sends only the relevant messages. Goal: engagement (users uploading threads and sharing insights).

## Stack

- **Framework**: Next.js 16 App Router (TypeScript)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + `tailwindcss-animate`
- **DB**: Prisma + Postgres + pgvector (for message embeddings)
- **Auth**: None currently — threads stored in browser `localStorage`
- **Hosting**: Vercel
- **Other notable libs**: Zustand (client state), OpenAI SDK (→ xAI Grok API), Recharts, React Dropzone, `@base-ui/react`

## Commands

```bash
# Install
npm install

# Dev
npm run dev            # runs on http://localhost:3000

# Test
npm test               # vitest unit tests (parser, store, utils)

# Lint
npm run lint

# Build
npm run build

# Prisma
npx prisma migrate dev    # apply migrations (dev)
npx prisma generate       # regenerate client after schema changes
npx prisma studio         # browse DB
```

No `typecheck` script — run `npx tsc --noEmit` to type-check manually.

## Project structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── upload/           # File upload + parsing entry point
│   ├── dashboard/        # Stats dashboard (message counts, top senders, etc.)
│   ├── chat/             # AI Q&A interface (xAI Grok)
│   └── api/              # API routes (AI calls, any server-side logic)
├── lib/
│   ├── parser.ts         # Core parser: WhatsApp / Telegram / iMessage → unified format
│   ├── store.ts          # Zustand store (client-side chat session state)
│   └── utils.ts          # Shared utilities
└── components/
    ├── HomeSessionsLink.tsx
    └── ui/               # Reusable UI primitives
prisma/
└── schema.prisma         # Postgres + pgvector schema (User, Chat, Message with embeddings)
```

Important files:
- `src/lib/parser.ts` — core logic; all chat format parsing lives here
- `src/lib/store.ts` — Zustand store; threads are stored in `localStorage` via this store
- `prisma/schema.prisma` — DB schema with vector support

## Conventions

- **Imports**: use `@/` alias (maps to `./src`)
- **Components**: PascalCase files, one component per file
- **State**: Zustand (`src/lib/store.ts`) for client-side chat sessions — no server state management library
- **Privacy first**: chat parsing happens in the browser (`src/lib/parser.ts`). Never move parsing to a server route.
- **AI**: xAI Grok via OpenAI SDK (base URL overridden). Only send the messages needed to answer a question — don't batch the full thread to the API.
- **No user accounts yet** — sessions are keyed in localStorage

## Git workflow

- Branches: `vipul/<short-description>` for solo work
- Commit style: conventional commits (`feat:`, `fix:`, `chore:`)
- PRs: include preview URL; screenshots for UI changes
- Squash-merge to `main`

## Deploy

- Production: Vercel auto-deploys on push to `main`
- Preview: every PR gets a preview URL — paste in PR description
- Env vars (Vercel dashboard): `XAI_API_KEY`, `DATABASE_URL`

## Database

Prisma + Postgres (with `pgvector` extension for message embeddings). Schema: `User`, `Chat`, `Message` (with optional `vector` embedding field).
- Migrations: `npx prisma migrate dev` (dev), `npx prisma migrate deploy` (prod)
- Generate client after schema changes: `npx prisma generate`
- **Never edit a migration that has been applied** — create a new one instead.

## Testing philosophy

- vitest unit tests in `src/lib/` (parser, store, utils)
- Integration tests: `src/lib/downloads.integration.test.ts`
- Parser is the critical path — test new format support thoroughly

## Things that are out of scope

- Don't move chat parsing server-side — privacy guarantee requires browser-only parsing
- Don't persist full chat text on the server — only embeddings and metadata

## Known gotchas

- **Next.js 16 breaking changes**: APIs and conventions differ from training data. Read `node_modules/next/dist/docs/` before writing routing code.
- `prisma/schema.prisma` uses `Unsupported("vector")` for the pgvector type — normal Prisma client won't fully type this field. Don't try to "fix" it with a standard type.
- xAI Grok is accessed via the OpenAI SDK with a custom base URL — it's not actually calling OpenAI. Don't swap in OpenAI models without checking the xAI model name mapping.

## Product context

- **Audience**: People in active group chats (WhatsApp friend groups, family threads) curious about their own chat dynamics
- **Goal right now**: Engagement — users parsing threads and sharing stats or insights
- **Voice**: Gen Z, Instagram-native, young and self-aware. Playful, a little cheeky. Speaks the language of people who live in group chats.
- **Pricing**: Free (no pricing model yet)
- **What we'd never say**: Anything surveillance-y, creepy, or corporate. The privacy angle is a feature — don't undermine it.

## Decision log

Log significant architectural decisions here so they're not relitigated.
