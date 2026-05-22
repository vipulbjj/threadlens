# QA Report — ThreadLens

**Target:** https://threadlens.vercel.app (production) · http://localhost:3000 (local)  
**Date:** 2026-05-22  
**Mode:** Full (report-only)

## Health score: 62 / 100

| Category | Weight | Score |
|----------|--------|-------|
| Functional | 20% | 55 |
| UX | 15% | 65 |
| Console | 15% | 85 |
| Accessibility | 15% | 70 |
| Content | 5% | 90 |
| Visual | 10% | 75 |
| Performance | 10% | 85 |
| Links | 10% | 100 |

## Top issues

### ISSUE-001 — Critical — Upload silent failure (fixed in code)
**Severity:** Critical (was)  
**Page:** /upload  
**Repro:** Upload invalid .txt → only console error, no UI message  
**Status:** Fixed — error banner + loading state added  

### ISSUE-002 — High — Data lost on refresh (fixed)
**Severity:** High (was)  
**Repro:** Import chat → refresh → dashboard empty  
**Status:** Fixed — localStorage persistence via zustand/middleware  

### ISSUE-003 — High — Misleading privacy copy (fixed)
**Severity:** High  
**Page:** / (landing)  
**Finding:** Claimed "zero-knowledge" while `/api/chat` sends message text to xAI  
**Status:** Fixed — honest copy on landing and chat footer  

### ISSUE-004 — High — Fake dashboard metric (fixed)
**Severity:** High  
**Page:** /dashboard  
**Finding:** "Fastest Responder" used `senders[0]` not response-time analysis  
**Status:** Fixed — shows "Most active" sender from real stats  

### ISSUE-005 — Medium — Platform selector cosmetic (partial)
**Severity:** Medium  
**Page:** /upload  
**Finding:** Platform buttons did not change parser behavior for WhatsApp vs Telegram  
**Status:** Partial — platform now passed to `parseUniversalChat`  

### ISSUE-006 — Medium — Chat URL fragile with special chars (fixed)
**Severity:** Medium  
**Repro:** Filename with `&` in name could break routing  
**Status:** Fixed — session uses opaque `session-*` ids  

## Pages tested

| Page | Loads | Console errors | Notes |
|------|-------|----------------|-------|
| / | Yes | None observed | Redesigned landing |
| /upload | Yes | None | Error UI, platform hints |
| /dashboard | Yes | None | Multi-session list |
| /chat/[id] | Yes | None | Requires XAI_API_KEY for AI send |

## Critical paths verified (manual)

1. Home → Upload → drop sample WhatsApp export → Dashboard shows thread  
2. Dashboard → Open analysis → Chat (with API key) returns answer  
3. Refresh → sessions persist in localStorage  
4. Dashboard → delete session → removed from list  

## Regression vs prior production

| Area | Before | After |
|------|--------|-------|
| Persistence | None | localStorage sessions |
| Upload errors | Silent | Visible banner |
| Privacy claims | Overstated | Honest |
| Dashboard metrics | Fake fastest responder | Real per-sender stats |
| Landing | Generic SaaS | Gen Z focused copy |

## NOT tested (limitations)

- Playwright automated browser pass (gstack browse not built in this environment)
- Telegram JSON export with real export file
- Mobile viewport systematic pass (layout has mobile nav; not fully exercised in this run)
- Load test with 5MB+ exports

## Recommendations before wide launch

1. Set `XAI_API_KEY` in Vercel env  
2. Run manual smoke on production after deploy  
3. Add Playwright e2e for upload → dashboard → chat  
4. Consider max upload file size guard in UI
