# Supabase setup for ThreadLens auth

1. Create a project at [supabase.com](https://supabase.com) named **threadlens** (free tier is fine).
2. In **Project Settings → API**, create a **new API key** named `threadlens` (or use the default anon + service_role keys).
3. Run `supabase/schema.sql` in the SQL editor.
4. In **Authentication → URL configuration**, set:
   - Site URL: `https://threadlens.vercel.app`
   - Redirect URLs: `https://threadlens.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
5. Enable **Email** provider. Confirm email if you want verification on signup.
6. Add Vercel environment variables:

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API (server only, never expose to client) |
| `AZURE_OPENAI_API_KEY` | Azure Portal → openclaw-openai-svc01 → Keys (see [AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md)) |
| `AZURE_OPENAI_ENDPOINT` | Same page, e.g. `https://openclaw-openai-svc01.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name, e.g. `gpt-4o-mini` |
| `XAI_API_KEY` | Optional fallback if Azure unset |
| `PREMIUM_EMAILS` | Comma-separated emails to auto-enable premium, e.g. `vbajaj56@gmail.com` |
| `PREMIUM_CONTACT_EMAIL` | Inbox for premium requests (also set `NEXT_PUBLIC_PREMIUM_CONTACT_EMAIL` for client mailto links) |

## Enable premium for a user

**Option A:** Add their email to `PREMIUM_EMAILS` in Vercel and redeploy (or wait for next request to `/api/me`).

**Option B:** In Supabase table editor, set `profiles.is_premium = true` for their user id.

Users can also tap **Request Premium** in the app — rows land in `premium_requests`.

## Forgot password

Uses Supabase `resetPasswordForEmail` → link opens `/auth/callback` → user sets password on `/account`.

## Tier limits (in app code)

| | Free | Premium |
|---|------|---------|
| Import cap | Last 35k messages | Full thread |
| AI questions / day | 30 (signed in) | 150 default (`PREMIUM_AI_DAILY_CAP` on Vercel) |
| AI context sent | Last 350 msgs, 280 chars each, ~28k chars | Last 500 msgs, ~48k chars |
| Upload file size | 100 MB | ~512 MB (device RAM is the real limit) |

Premium upload is not capped at 200 MB anymore — that was an arbitrary guardrail. Parsing runs in the browser, so very large `.txt` files depend on phone/laptop memory, not Supabase.

### Public deploy — token abuse guards

- `/api/chat` requires sign-in when Supabase + `XAI_API_KEY` are set.
- Per-user daily caps: 30 (free), 150 premium default — set `PREMIUM_AI_DAILY_CAP=500` on Vercel if you need more for your own account.
- Context to the model is capped (message count, per-message length, total characters) so one request cannot send a full 35k-message export to xAI.
- Request body max 2 MB; `max_tokens` 500 (free) / 800 (premium) per answer.

## AI provider

Production prefers **Azure OpenAI** when `AZURE_OPENAI_*` is set. Full key + deployment steps: **[AZURE_OPENAI_SETUP.md](./AZURE_OPENAI_SETUP.md)**.

## AI debugging (Azure / xAI / Vercel)

If chat shows **503** with `[xai_auth]` or “Bad credentials”:

1. **Verify the key locally** (never commits the key):
   ```bash
   npm run verify:xai
   ```
   Loads `XAI_API_KEY` from `.env`, `.env.local`, or `.env.production.local`.

2. **Fix on Vercel:** [console.x.ai](https://console.x.ai/) → new API key (grant model + chat permissions) → Vercel → **Settings → Environment Variables** → update `XAI_API_KEY` for **Production** → redeploy.

3. **Probe production while signed in** (browser DevTools console on threadlens.vercel.app):
   ```js
   fetch("/api/ai-health", { credentials: "include" }).then((r) => r.json()).then(console.log);
   ```
   Returns `{ ok, provider, model, code, detail }` without exposing the API key.

## Cursor Supabase MCP

If the agent should create the project for you: complete **Supabase MCP** auth when Cursor prompts (Settings → MCP → Supabase → authenticate). Until that finishes, only `mcp_auth` is available and dashboard automation is blocked.
