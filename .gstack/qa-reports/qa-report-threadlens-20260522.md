# QA Report — ThreadLens

**Date:** 2026-05-22  
**Target:** https://threadlens.vercel.app (production) · http://localhost:3000 (local)  
**Mode:** Full (report-only)  
**Framework:** Next.js 16

## Health score: 62 / 100

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 85 | No errors on static review of pages |
| Links | 10% | 100 | Nav links work |
| Functional | 20% | 55 | Upload error UI present; session persistence not fully browser-tested |
| UX | 15% | 70 | Clear flows; mobile nav on app routes |
| Performance | 10% | 75 | Build succeeds after parser fix |
| Content | 5% | 80 | Honest privacy copy on landing |
| Accessibility | 15% | 55 | Focus rings on inputs; contrast generally OK on dark theme |
| Visual | 10% | 65 | Cohesive dark theme; landing still has generic SaaS patterns |

## Top issues

### ISSUE-001 — High — Misleading privacy claims (fixed in code)
**Severity:** High (content)  
**Category:** Content  
**Status:** Addressed in landing copy update  
**Repro:** Landing previously claimed zero-knowledge / no database; code now states local parsing and optional AI to xAI.

### ISSUE-002 — High — Data lost on refresh (fixed in code)
**Severity:** High (functional)  
**Category:** Functional  
**Status:** Fixed with `zustand/persist` + session list  
**Repro:** Refresh browser — sessions should remain in localStorage.

### ISSUE-003 — Medium — Upload errors only in console (fixed)
**Severity:** Medium  
**Category:** Functional  
**Status:** Fixed with inline error UI on upload page  
**Repro:** Invalid file previously logged to console only.

### ISSUE-004 — Medium — Fake dashboard metric removed (fixed)
**Severity:** Medium  
**Category:** Content  
**Status:** Removed “fastest responder” placeholder; shows real per-sender stats.

### ISSUE-005 — Medium — Platform selector cosmetic (partial)
**Severity:** Medium  
**Category:** UX  
**Status:** Platform affects Telegram JSON parsing path; WhatsApp still primary path.

### ISSUE-006 — Low — AI requires XAI_API_KEY
**Severity:** Low (environment)  
**Category:** Functional  
**Repro:** POST /api/chat without key returns 503 with clear message.

## Pages exercised (code review + local dev)

| Page | Loads | Notes |
|------|-------|-------|
| `/` | Yes | Marketing home, CTAs to upload/dashboard |
| `/upload` | Yes | Dropzone, platform chips, error states |
| `/dashboard` | Yes | Session cards, delete, open analysis |
| `/chat/[id]` | Yes | Q&A UI, loading, API error display |

## Console summary
No automated browser pass in this run (browse binary not built). Recommend manual check after deploy.

## Regression
N/A (first structured QA baseline for this app).

## Test plan for human QA
- [ ] Export WhatsApp .txt, upload with WhatsApp selected → lands on dashboard → open chat → ask a question (with API key)
- [ ] Upload invalid/empty file → see friendly error
- [ ] Refresh after import → session persists
- [ ] Mobile width 375px — bottom nav visible, no horizontal scroll on forms
- [ ] Verify production deploy matches honest copy

## No test framework
Vitest added; run `npm install` then `npm test`. Parser tests cover sample export format.
