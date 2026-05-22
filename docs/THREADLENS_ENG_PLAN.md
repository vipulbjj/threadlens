# ThreadLens — Engineering plan (ship-ready)

## Goal
Make ThreadLens trustworthy and usable for young people analyzing real chat exports: local parsing, persisted sessions, honest privacy copy, and optional Grok Q&A.

## What already exists
- Next.js 16 app with routes `/`, `/upload`, `/dashboard`, `/chat/[id]`, `/api/chat`
- Zustand store (in-memory only — data lost on refresh)
- WhatsApp-oriented parser + Grok via OpenAI-compatible API

## Architecture (target)

```text
Browser (localStorage persist)
  → Zustand sessions[] (id, name, platform, messages[])
  → /upload parseUniversalChat(platform-aware)
  → /dashboard stats (real metrics, multi-session)
  → /chat/[sessionId] → POST /api/chat (subset of messages only)
```

## Implementation tasks

### P1 — Persistence & sessions
- Replace single-chat store with `ChatSession[]` + `activeSessionId`
- Cap stored messages per session (e.g. last 8000) for localStorage quota
- Route `/chat/[id]` by stable session id (not filename)

### P1 — Parser & upload UX
- Platform selector affects parsing (Telegram JSON path, WhatsApp regex, generic fallback)
- User-visible errors on parse failure (no silent `console.error`)
- Loading state on upload and send

### P1 — Honest product surface
- Remove/replace misleading “zero-knowledge / never hits database” claims on landing
- Dashboard: remove fake “fastest responder”; show per-person stats from `getChatStats`
- Chat footer: clarify that message text is sent to xAI when user asks

### P2 — Quality
- Vitest for parser (sample exports + edge cases)
- Optional: sample fixture `.txt` in repo for manual QA

### P3 — NOT in this pass (defer)
- Clerk/Prisma wiring (deps unused)
- Server-side chat history DB
- Playwright e2e (recommended before wide launch)

## Failure modes
| Risk | Mitigation |
|------|------------|
| localStorage full | Trim messages per session; warn user |
| xAI key missing | Clear 503 + setup docs in README |
| Huge export OOM | Stream read not implemented yet — document max file size (~5MB) |
| Wrong platform | User-selectable platform + hints |

## Test plan
- `npm run test` — parser unit tests
- `npm run build` — production build
- Manual: upload sample WhatsApp .txt → dashboard → chat → ask question (with API key)
- Manual: refresh page — session still there
- Production smoke: https://threadlens.vercel.app

## Parallelization
- Lane A: store + parser + upload (sequential)
- Lane B: dashboard + chat + landing (after store API stable)

## GSTACK REVIEW REPORT

| Review | Trigger | Status | Findings |
|--------|---------|--------|----------|
| Eng Review | /plan-eng-review | issues_open | Persistence, honest copy, parser errors, tests |
| Design Review | /design-review | issues_found | AI slop patterns, mobile nav, typography |
| QA-only | /qa-only | issues_found | Upload errors, session list, API failures |

**VERDICT:** Core P1 eng items implemented in this session. QA report in `threadlens/.gstack/qa-reports/qa-report-threadlens-20260522.md`. Re-run browser QA after deploy; add `XAI_API_KEY` on Vercel for AI chat.

## Implementation Tasks

- [x] **T1 (P1)** — Store — Multi-session Zustand + localStorage persist
- [x] **T2 (P1)** — Upload — Inline parse errors + platform-aware parser
- [x] **T3 (P1)** — Landing/Dashboard — Honest privacy + real stats
- [x] **T4 (P2)** — Tests — Vitest parser + store + CI workflow
- [ ] **T5 (P3)** — E2E — Playwright upload→dashboard→chat (deferred)
